/**
 * server.js — FlowCare Express API server
 *
 * Runs on port 3001 (React dev server proxies /api/* here).
 *
 * Routes:
 *   POST /api/auth/login              — verify credentials
 *   GET  /api/settings/:username      — load cycle settings
 *   PUT  /api/settings/:username      — save cycle settings
 *   GET  /api/symptoms/:username      — load all symptoms for a user
 *   PUT  /api/symptoms/:username/:date — upsert symptoms for one day
 */

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { getDb } = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { username: string, password: string }
 * Returns: { ok: true, username } | { ok: false, message }
 */
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password are required." });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT username, password_hash FROM users WHERE username = ?")
    .get(username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ ok: false, message: "Invalid username or password." });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ ok: false, message: "Invalid username or password." });
  }

  // Ensure user_settings row exists (in case it was somehow missing)
  db.prepare(
    `INSERT OR IGNORE INTO user_settings (username) VALUES (?)`
  ).run(user.username);

  res.json({ ok: true, username: user.username });
});

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * GET /api/settings/:username
 * Returns the user's cycle configuration from SQLite.
 */
app.get("/api/settings/:username", (req, res) => {
  const db = getDb();
  const row = db
    .prepare("SELECT cycle_length, period_length, last_period FROM user_settings WHERE username = ?")
    .get(req.params.username);

  if (!row) {
    return res.status(404).json({ message: "User settings not found." });
  }

  res.json({
    cycleLength: row.cycle_length,
    periodLength: row.period_length,
    lastPeriod: row.last_period,
  });
});

/**
 * PUT /api/settings/:username
 * Body: { cycleLength, periodLength, lastPeriod }
 * Upserts cycle configuration for the user.
 */
app.put("/api/settings/:username", (req, res) => {
  const { cycleLength, periodLength, lastPeriod } = req.body;
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

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

// ─── Symptoms ─────────────────────────────────────────────────────────────────

/**
 * GET /api/symptoms/:username
 * Returns all symptom rows for a user as a keyed object: { "YYYY-MM-DD": {...} }
 */
app.get("/api/symptoms/:username", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare("SELECT date, flow, mood, pain_list, water, sleep FROM symptoms WHERE username = ?")
    .all(req.params.username);

  // Convert flat array to the object structure the frontend expects
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

/**
 * PUT /api/symptoms/:username/:date
 * Body: { flow, mood, painList, water, sleep }
 * Upserts a single day's symptom log.
 */
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

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✅ FlowCare API server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
