const { getClient, ensureSchema } = require("../_db");

module.exports = async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ ok: false, message: "Username is required." });
  }

  await ensureSchema();
  const db = getClient();

  if (req.method === "GET") {
    const result = await db.execute({
      sql: "SELECT cycle_length, period_length, last_period FROM user_settings WHERE username = ?",
      args: [username],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "User settings not found." });
    }

    const row = result.rows[0];
    return res.json({
      ok: true,
      cycleLength: row.cycle_length,
      periodLength: row.period_length,
      lastPeriod: row.last_period,
    });
  }

  if (req.method === "PUT") {
    const { cycleLength, periodLength, lastPeriod } = req.body || {};

    await db.execute({
      sql: `INSERT INTO user_settings (username, cycle_length, period_length, last_period)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
              cycle_length  = excluded.cycle_length,
              period_length = excluded.period_length,
              last_period   = excluded.last_period`,
      args: [username, cycleLength ?? 28, periodLength ?? 5, lastPeriod ?? ""],
    });

    return res.json({ ok: true });
  }

  res.status(405).json({ ok: false, message: "Method not allowed." });
};
