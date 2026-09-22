// Best effort writes: notification failures must not roll back successful work.
function notificationService(pool) {
  async function createNotification(userId, type, title, message, link, actorId) {
    if (actorId != null && String(userId) === String(actorId)) return;
    try {
      // Resolve display names here so even a failed lookup cannot fail the action.
      if (actorId != null) {
        const actor = await pool.query("SELECT name FROM users WHERE id = $1", [actorId]);
        message = message.replace("{actor}", () => actor.rows[0]?.name || "Someone");
      }
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, type, title, message, link]
      );
    } catch {
      console.error("Could not create notification.");
    }
  }

  function registerRoutes(app, authenticateToken) {
    app.get("/api/notifications", authenticateToken, async (req, res) => {
      try {
        const result = await pool.query(
          `SELECT
             (SELECT COUNT(*)::int FROM notifications WHERE user_id = $1 AND NOT is_read) AS "unreadCount",
             COALESCE((SELECT json_agg(recent ORDER BY recent.created_at DESC, recent.id::bigint DESC)
               FROM (SELECT id::text, type, title, message, link, is_read, created_at
                     FROM notifications WHERE user_id = $1
                     ORDER BY created_at DESC, notifications.id DESC LIMIT 20) recent), '[]'::json) AS notifications`,
          [req.user.id]
        );
        res.json(result.rows[0]);
      } catch {
        console.error("Could not load notifications.");
        res.status(500).json({ message: "Could not load notifications." });
      }
    });

    app.patch("/api/notifications/read-all", authenticateToken, async (req, res) => {
      try {
        await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND NOT is_read", [req.user.id]);
        res.json({ message: "Notifications marked as read." });
      } catch {
        console.error("Could not mark notifications as read.");
        res.status(500).json({ message: "Could not mark notifications as read." });
      }
    });

    app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
      const id = req.params.id;
      if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
        return res.status(400).json({ message: "Invalid notification ID." });
      }
      try {
        const result = await pool.query(
          "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id::text",
          [id, req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Notification not found." });
        res.json({ id: result.rows[0].id, is_read: true });
      } catch {
        console.error("Could not mark notification as read.");
        res.status(500).json({ message: "Could not mark notification as read." });
      }
    });
  }
  return { createNotification, registerRoutes };
}

module.exports = { notificationService };
