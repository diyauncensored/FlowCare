const bcrypt = require("bcryptjs");
const { getClient, ensureSchema } = require("../_db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password are required." });
  }

  await ensureSchema();
  const db = getClient();

  const result = await db.execute({
    sql: "SELECT username, password_hash FROM users WHERE username = ?",
    args: [username.trim().toLowerCase()],
  });

  const user = result.rows[0];

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ ok: false, message: "Invalid username or password." });
  }

  // Ensure settings row exists
  await db.execute({
    sql: "INSERT OR IGNORE INTO user_settings (username) VALUES (?)",
    args: [user.username],
  });

  res.json({ ok: true, username: user.username });
};
