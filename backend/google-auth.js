const { OAuth2Client } = require("google-auth-library");

// Dependencies are injectable so verification and database failures can be tested offline.
function createGoogleAuthHandler({ pool, createSession, googleClient = new OAuth2Client() }) {
  return async (req, res) => {
    const audience = process.env.GOOGLE_CLIENT_ID;
    if (!audience) {
      return res.status(503).json({ message: "Google sign-in is currently unavailable. Please use email." });
    }
    const credential = req.body?.credential;
    if (typeof credential !== "string" || !credential.trim() || credential.length > 16384) {
      return res.status(400).json({ message: "Please try Continue with Google again." });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience });
      payload = ticket.getPayload();
      if (!payload || typeof payload.sub !== "string" || !payload.sub ||
          typeof payload.email !== "string" || !payload.email.trim() ||
          payload.email_verified !== true) {
        throw new Error("Required verified claims missing");
      }
    } catch {
      return res.status(401).json({ message: "Google could not verify your account. Please try again." });
    }

    const email = payload.email.trim().toLowerCase();
    // Retry a uniqueness race after rollback, then resolve the winning account normally.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let client;
      try {
        client = await pool.connect();
        await client.query("BEGIN");
        let result = await client.query("SELECT id, name, email, google_id FROM users WHERE google_id = $1 FOR UPDATE", [payload.sub]);
        let user = result.rows[0];
        if (!user) {
          result = await client.query("SELECT id, name, email, google_id FROM users WHERE lower(btrim(email)) = $1 FOR UPDATE", [email]);
          if (result.rows.length > 1 || (result.rows[0]?.google_id && result.rows[0].google_id !== payload.sub)) {
            await client.query("ROLLBACK");
            return res.status(409).json({ message: "This email is linked to another account. Please use your existing sign-in method." });
          }
          user = result.rows[0];
          if (user) {
            result = await client.query("UPDATE users SET google_id = $1, email_verified = TRUE WHERE id = $2 RETURNING id, name, email", [payload.sub, user.id]);
          } else {
            const name = typeof payload.name === "string" && payload.name.trim()
              ? payload.name.trim() : email.split("@")[0];
            result = await client.query("INSERT INTO users (name, email, google_id, email_verified, password) VALUES ($1, $2, $3, TRUE, NULL) RETURNING id, name, email", [name, email, payload.sub]);
          }
          user = result.rows[0];
        }
        const session = createSession(user);
        await client.query("COMMIT");
        return res.json(session);
      } catch (error) {
        if (client) await client.query("ROLLBACK").catch(() => {});
        if (error.code === "23505" && attempt === 0) continue;
        // Do not log provider errors, credentials, or database query parameters.
        return res.status(500).json({ message: "Could not sign in with Google. Please try again later." });
      } finally {
        client?.release();
      }
    }
  };
}

module.exports = { createGoogleAuthHandler };
