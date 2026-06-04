const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { getDb } = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password are required." });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT username, password_hash FROM users WHERE username = ?")
    .get(username.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ ok: false, message: "Invalid username or password." });
  }

  // Make sure the user has a settings row (shouldn't be missing, but just in case)
  db.prepare("INSERT OR IGNORE INTO user_settings (username) VALUES (?)").run(user.username);

  res.json({ ok: true, username: user.username });
});

// GET /api/settings/:username
app.get("/api/settings/:username", (req, res) => {
  const db = getDb();
  const row = db
    .prepare("SELECT cycle_length, period_length, last_period FROM user_settings WHERE username = ?")
    .get(req.params.username);

  if (!row) return res.status(404).json({ message: "User settings not found." });

  res.json({
    cycleLength: row.cycle_length,
    periodLength: row.period_length,
    lastPeriod: row.last_period,
  });
});

// PUT /api/settings/:username
app.put("/api/settings/:username", (req, res) => {
  const { cycleLength, periodLength, lastPeriod } = req.body;
  const { username } = req.params;

  if (!username) return res.status(400).json({ message: "Username is required." });

  const db = getDb();
  db.prepare(
    `INSERT INTO user_settings (username, cycle_length, period_length, last_period)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(username) DO UPDATE SET
       cycle_length  = excluded.cycle_length,
       period_length = excluded.period_length,
       last_period   = excluded.last_period`
  ).run(username, cycleLength ?? 28, periodLength ?? 5, lastPeriod ?? "");

  res.json({ ok: true });
});

// GET /api/symptoms/:username
app.get("/api/symptoms/:username", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare("SELECT date, flow, mood, pain_list, water, sleep FROM symptoms WHERE username = ?")
    .all(req.params.username);

  const result = {};
  for (const row of rows) {
    result[row.date] = {
      flow: row.flow,
      mood: row.mood,
      painList: JSON.parse(row.pain_list || "[]"),
      water: row.water,
      sleep: row.sleep,
    };
  }

  res.json(result);
});

// PUT /api/symptoms/:username/:date
app.put("/api/symptoms/:username/:date", (req, res) => {
  const { username, date } = req.params;
  const { flow = "", mood = "", painList = [], water = 0, sleep = 8 } = req.body;

  const db = getDb();
  db.prepare(
    `INSERT INTO symptoms (username, date, flow, mood, pain_list, water, sleep)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(username, date) DO UPDATE SET
       flow      = excluded.flow,
       mood      = excluded.mood,
       pain_list = excluded.pain_list,
       water     = excluded.water,
       sleep     = excluded.sleep`
  ).run(username, date, flow, mood, JSON.stringify(painList), water, sleep);

  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n✅ FlowCare API running at http://localhost:${PORT}\n`);
});
