const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "flowcare.db")
  : path.join(__dirname, "flowcare.db");

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    UNIQUE NOT NULL,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      username      TEXT PRIMARY KEY REFERENCES users(username) ON DELETE CASCADE,
      cycle_length  INTEGER NOT NULL DEFAULT 28,
      period_length INTEGER NOT NULL DEFAULT 5,
      last_period   TEXT    NOT NULL DEFAULT ''
    );

    -- One row per user per day
    CREATE TABLE IF NOT EXISTS symptoms (
      username  TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      date      TEXT NOT NULL,
      flow      TEXT NOT NULL DEFAULT '',
      mood      TEXT NOT NULL DEFAULT '',
      pain_list TEXT NOT NULL DEFAULT '[]',
      water     INTEGER NOT NULL DEFAULT 0,
      sleep     REAL    NOT NULL DEFAULT 8,
      PRIMARY KEY (username, date)
    );
  `);

  seedDemoUser();
}

function seedDemoUser() {
  // Credentials can be overridden via env vars without touching this file
  const username = process.env.FLOWCARE_DEMO_USER || "demo@flowcare.com";
  const password = process.env.FLOWCARE_DEMO_PASSWORD || "FlowCare123!";

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!existing) {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, passwordHash);
    db.prepare(
      `INSERT OR IGNORE INTO user_settings (username, cycle_length, period_length, last_period)
       VALUES (?, 28, 5, ?)`
    ).run(username, getDefaultLastPeriod());
    console.log(`[DB] Demo user seeded: ${username}`);
  }
}

function getDefaultLastPeriod() {
  const d = new Date();
  d.setDate(d.getDate() - 10);
  return d.toISOString().split("T")[0];
}

module.exports = { getDb };
