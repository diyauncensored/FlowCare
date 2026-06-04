/**
 * flowcareApi.js — Centralized API client for FlowCare backend
 *
 * All calls go to /api/* which the React dev server proxies to
 * the Express backend on port 3001 (configured via "proxy" in package.json).
 *
 * Every function gracefully handles the backend being offline:
 *   - loginUser:    returns { ok: false, serverReachable: false } on network error
 *   - getSettings:  returns null (caller falls back to localStorage defaults)
 *   - saveSettings: silently no-ops if offline
 *   - getSymptoms:  returns {} if offline
 *   - saveSymptom:  silently no-ops if offline
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 5000, // 5 second timeout — don't hang forever if backend is down
  headers: { "Content-Type": "application/json" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the error means the server is DOWN or UNREACHABLE.
 *
 * This covers three cases:
 *   1. No response at all (pure network/DNS failure)
 *   2. Axios timeout (ECONNABORTED) — server didn't respond in time
 *   3. 5xx HTTP response — the CRA dev proxy returns 502/504 HTML
 *      when it can't reach the Express backend. We must NOT treat these
 *      as real auth failures (wrong password), since the data is HTML.
 */
function isServerDown(err) {
  if (!err.response) return true;                      // no response
  if (err.code === "ECONNABORTED") return true;        // axios timeout
  if (err.response.status >= 500) return true;         // 5xx proxy error
  return false;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Attempt to log in with the given credentials.
 *
 * Returns one of:
 *   { ok: true,  username, serverReachable: true }
 *   { ok: false, message, serverReachable: true }   ← wrong password (401)
 *   { ok: false, message, serverReachable: false }  ← backend is down
 */
export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/login", { username, password });
    return { ...res.data, serverReachable: true };
  } catch (err) {
    if (isServerDown(err)) {
      console.warn("[API] Backend unreachable during login.");
      return { ok: false, serverReachable: false, message: "Backend offline." };
    }
    // Got a 4xx response (e.g. 401 Unauthorized) — real auth failure from the server
    const message =
      err.response?.data?.message || "Invalid username or password.";
    return { ok: false, serverReachable: true, message };
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Fetch cycle settings for a user from the database.
 * Returns the settings object, or null if the backend is offline.
 */
export async function getSettings(username) {
  try {
    const res = await api.get(`/settings/${encodeURIComponent(username)}`);
    return res.data;
  } catch (err) {
    if (isServerDown(err)) {
      console.warn("[API] getSettings: backend offline, using localStorage fallback.");
      return null; // caller handles fallback
    }
    console.error("[API] getSettings error:", err.response?.data || err.message);
    return null;
  }
}

/**
 * Save cycle settings for a user to the database.
 * Silently no-ops if the backend is offline.
 */
export async function saveSettings(username, settings) {
  try {
    await api.put(`/settings/${encodeURIComponent(username)}`, settings);
  } catch (err) {
    if (isServerDown(err)) {
      console.warn("[API] saveSettings: backend offline, change not persisted to DB.");
      return;
    }
    console.error("[API] saveSettings error:", err.response?.data || err.message);
  }
}

// ─── Symptoms ─────────────────────────────────────────────────────────────────

/**
 * Fetch all logged symptoms for a user.
 * Returns an empty object if the backend is offline.
 */
export async function getSymptoms(username) {
  try {
    const res = await api.get(`/symptoms/${encodeURIComponent(username)}`);
    return res.data;
  } catch (err) {
    if (isServerDown(err)) {
      console.warn("[API] getSymptoms: backend offline, using localStorage fallback.");
      return null; // caller handles fallback
    }
    console.error("[API] getSymptoms error:", err.response?.data || err.message);
    return null;
  }
}

/**
 * Save or update symptoms for a specific date.
 * Silently no-ops if the backend is offline.
 */
export async function saveSymptom(username, date, symptomData) {
  try {
    await api.put(
      `/symptoms/${encodeURIComponent(username)}/${date}`,
      symptomData
    );
  } catch (err) {
    if (isServerDown(err)) {
      console.warn("[API] saveSymptom: backend offline, symptom not persisted to DB.");
      return;
    }
    console.error("[API] saveSymptom error:", err.response?.data || err.message);
  }
}
