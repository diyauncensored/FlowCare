/**
 * flowcareApi.js — Centralized API client for FlowCare backend
 *
 * All calls go to /api/* which the React dev server proxies to
 * the Express backend on port 3001 (configured via "proxy" in package.json).
 *
 * In production, these would hit your deployed API server's base URL.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Attempt to log in with the given credentials.
 * @returns {{ ok: boolean, username?: string, message?: string }}
 */
export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/login", { username, password });
    return res.data; // { ok: true, username }
  } catch (err) {
    const message =
      err.response?.data?.message || "Login failed. Please try again.";
    return { ok: false, message };
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Fetch cycle settings for a user from the database.
 * @returns {{ cycleLength, periodLength, lastPeriod } | null}
 */
export async function getSettings(username) {
  try {
    const res = await api.get(`/settings/${encodeURIComponent(username)}`);
    return res.data;
  } catch (err) {
    console.error("[API] getSettings failed:", err.message);
    return null;
  }
}

/**
 * Save cycle settings for a user to the database.
 * @param {string} username
 * @param {{ cycleLength: number, periodLength: number, lastPeriod: string }} settings
 */
export async function saveSettings(username, settings) {
  try {
    await api.put(`/settings/${encodeURIComponent(username)}`, settings);
  } catch (err) {
    console.error("[API] saveSettings failed:", err.message);
  }
}

// ─── Symptoms ─────────────────────────────────────────────────────────────────

/**
 * Fetch all logged symptoms for a user.
 * @returns {{ [date: string]: { flow, mood, painList, water, sleep } }}
 */
export async function getSymptoms(username) {
  try {
    const res = await api.get(`/symptoms/${encodeURIComponent(username)}`);
    return res.data;
  } catch (err) {
    console.error("[API] getSymptoms failed:", err.message);
    return {};
  }
}

/**
 * Save or update symptoms for a specific date.
 * @param {string} username
 * @param {string} date — 'YYYY-MM-DD'
 * @param {{ flow, mood, painList, water, sleep }} symptomData
 */
export async function saveSymptom(username, date, symptomData) {
  try {
    await api.put(
      `/symptoms/${encodeURIComponent(username)}/${date}`,
      symptomData
    );
  } catch (err) {
    console.error("[API] saveSymptom failed:", err.message);
  }
}
