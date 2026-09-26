const USER_REASONS = ['suspicious_account', 'harassment', 'inappropriate_behavior', 'misleading_profile', 'unsafe_behavior', 'other'];
const JOB_REASONS = ['fake_or_spam', 'misleading_details', 'misleading_payment', 'unsafe_work', 'inappropriate_content', 'other'];

function validId(id) {
  return /^[1-9]\d{0,18}$/.test(String(id)) && BigInt(id) <= 9223372036854775807n;
}

// Short transactions share a lock so blocking cannot race with a new interaction.
// Acquire before job/application locks. PostgreSQL releases it on commit/rollback.
async function lockSafetyWrites(db) {
  await db.query('SELECT pg_advisory_xact_lock(73190421)');
}

async function usersBlockedBetween(db, userA, userB) {
  const result = await db.query(`SELECT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = $1 AND blocked_user_id = $2)
       OR (blocker_id = $2 AND blocked_user_id = $1)
  ) AS blocked`, [userA, userB]);
  return result.rows[0].blocked;
}

function registerSafetyRoutes(app, authenticateToken, pool) {
  for (const type of ['user', 'job']) {
    app.post(`/api/reports/${type}s/:targetId`, authenticateToken, async (req, res) => {
      const { targetId } = req.params;
      const { reason, details } = req.body || {};
      if (!validId(targetId)) return res.status(400).json({ message: 'Invalid report target.' });
      if (!(type === 'user' ? USER_REASONS : JOB_REASONS).includes(reason)) {
        return res.status(400).json({ message: 'Please select a valid reason.' });
      }
      if (details != null && (typeof details !== 'string' || details.length > 500)) {
        return res.status(400).json({ message: 'Details must be text of 500 characters or fewer.' });
      }
      try {
        const target = await pool.query(type === 'user'
          ? 'SELECT id FROM users WHERE id = $1'
          : 'SELECT id, posted_by_id FROM jobs WHERE id = $1', [targetId]);
        if (!target.rows.length) return res.status(404).json({ message: type === 'user' ? 'User not found.' : 'Work not found.' });
        const owner = type === 'user' ? target.rows[0].id : target.rows[0].posted_by_id;
        if (String(owner) === String(req.user.id)) {
          return res.status(400).json({ message: type === 'user' ? 'You cannot report yourself.' : 'You cannot report your own work.' });
        }
        const result = await pool.query(`INSERT INTO reports
          (reporter_id, report_type, reported_user_id, reported_job_id, reason, details)
          VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING RETURNING id`,
        [req.user.id, type, type === 'user' ? targetId : null, type === 'job' ? targetId : null, reason, details?.trim() || null]);
        if (!result.rows.length) return res.json({ alreadyReported: true, message: `You've already reported this ${type === 'user' ? 'user' : 'work'}.` });
        res.status(201).json({ message: type === 'user' ? 'Report submitted. Thank you for helping keep Karviam safe.' : 'Report submitted.' });
      } catch {
        res.status(500).json({ message: 'Could not submit report. Please try again.' });
      }
    });
  }

  app.get('/api/blocks', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(`SELECT u.id AS user_id, u.name, u.profile_picture_url, b.created_at
        FROM user_blocks b JOIN users u ON u.id = b.blocked_user_id
        WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`, [req.user.id]);
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: 'Could not load blocked users. Please try again.' });
    }
  });

  for (const method of ['post', 'delete']) {
    app[method]('/api/blocks/:userId', authenticateToken, async (req, res) => {
      const targetId = req.params.userId;
      if (!validId(targetId)) return res.status(400).json({ message: 'Invalid user.' });
      if (String(targetId) === String(req.user.id)) return res.status(400).json({ message: 'You cannot block yourself.' });
      let client;
      let committed = false;
      try {
        client = await pool.connect();
        await client.query('BEGIN');
        await lockSafetyWrites(client);
        const target = await client.query('SELECT id FROM users WHERE id = $1', [targetId]);
        if (!target.rows.length) return res.status(404).json({ message: 'User not found.' });
        let alreadyBlocked = false;
        if (method === 'post') {
          const result = await client.query(`INSERT INTO user_blocks (blocker_id, blocked_user_id)
            VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`, [req.user.id, targetId]);
          alreadyBlocked = result.rows.length === 0;
          await client.query(`UPDATE applications a SET status = 'rejected' FROM jobs j
            WHERE a.job_id = j.id AND a.status = 'pending'
            AND ((a.applicant_id = $1::bigint AND j.posted_by_id = $2::bigint::text)
              OR (a.applicant_id = $2::bigint AND j.posted_by_id = $1::bigint::text))`, [req.user.id, targetId]);
        } else {
          await client.query('DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_user_id = $2', [req.user.id, targetId]);
        }
        await client.query('COMMIT');
        committed = true;
        res.json({ message: method === 'delete' ? 'User unblocked.' : alreadyBlocked ? 'User is already blocked.' : 'User blocked.' });
      } catch {
        res.status(500).json({ message: 'Could not update blocked users. Please try again.' });
      } finally {
        if (client) {
          try { if (!committed) await client.query('ROLLBACK'); }
          finally { client.release(); }
        }
      }
    });
  }
}

module.exports = { registerSafetyRoutes, usersBlockedBetween, lockSafetyWrites, validId };
