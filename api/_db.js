const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

let client;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function initSchema() {
  const db = getClient();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    UNIQUE NOT NULL,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      username      TEXT PRIMARY KEY,
      cycle_length  INTEGER NOT NULL DEFAULT 28,
      period_length INTEGER NOT NULL DEFAULT 5,
      last_period   TEXT    NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      username  TEXT NOT NULL,
      date      TEXT NOT NULL,
      flow      TEXT NOT NULL DEFAULT '',
      mood      TEXT NOT NULL DEFAULT '',
      pain_list TEXT NOT NULL DEFAULT '[]',
      water     INTEGER NOT NULL DEFAULT 0,
      sleep     REAL    NOT NULL DEFAULT 8,
      PRIMARY KEY (username, date)
    );
  `);

  await seedDemoUser(db);
}

async function seedDemoUser(db) {
  const username = "demo@flowcare.com";
  const password = "FlowCare123!";

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [username],
  });

  if (existing.rows.length === 0) {
    const passwordHash = bcrypt.hashSync(password, 10);

    await db.execute({
      sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      args: [username, passwordHash],
    });

    const d = new Date();
    d.setDate(d.getDate() - 10);
    const defaultLastPeriod = d.toISOString().split("T")[0];

    await db.execute({
      sql: `INSERT OR IGNORE INTO user_settings (username, cycle_length, period_length, last_period)
            VALUES (?, 28, 5, ?)`,
      args: [username, defaultLastPeriod],
    });

    console.log(`[DB] Demo user seeded: ${username}`);
  }
}

let schemaReady = null;

// Call this at the top of every API handler to ensure tables + demo user exist
async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = initSchema();
  }
  await schemaReady;
}

module.exports = { getClient, ensureSchema };
