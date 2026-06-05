const { getClient, ensureSchema } = require("../_db");

module.exports = async function handler(req, res) {
  // params is an array: ["username"] or ["username", "date"]
  const params = req.query.params || [];
  const username = params[0];
  const date = params[1];

  if (!username) {
    return res.status(400).json({ ok: false, message: "Username is required." });
  }

  await ensureSchema();
  const db = getClient();

  // GET /api/symptoms/username — load all symptoms
  if (req.method === "GET" && !date) {
    const result = await db.execute({
      sql: "SELECT date, flow, mood, pain_list, water, sleep FROM symptoms WHERE username = ?",
      args: [username],
    });

    const symptoms = {};
    for (const row of result.rows) {
      symptoms[row.date] = {
        flow: row.flow,
        mood: row.mood,
        painList: JSON.parse(row.pain_list || "[]"),
        water: row.water,
        sleep: row.sleep,
      };
    }

    return res.json(symptoms);
  }

  // PUT /api/symptoms/username/date — upsert one day
  if (req.method === "PUT" && date) {
    const { flow = "", mood = "", painList = [], water = 0, sleep = 8 } = req.body || {};

    await db.execute({
      sql: `INSERT INTO symptoms (username, date, flow, mood, pain_list, water, sleep)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(username, date) DO UPDATE SET
              flow      = excluded.flow,
              mood      = excluded.mood,
              pain_list = excluded.pain_list,
              water     = excluded.water,
              sleep     = excluded.sleep`,
      args: [username, date, flow, mood, JSON.stringify(painList), water, sleep],
    });

    return res.json({ ok: true });
  }

  res.status(405).json({ ok: false, message: "Method not allowed." });
};
