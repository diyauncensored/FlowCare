import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 2000, // short timeout — fail fast if backend isn't there
  headers: { "Content-Type": "application/json" },
});

// Returns true when the error (or response) means the backend simply isn't running.
// This covers: no response, axios timeout, proxy 5xx, Vercel 404, and the tricky
// case where Vercel's SPA fallback serves index.html with status 200 for POST requests.
function isServerDown(err) {
  if (!err.response) return true;
  if (err.code === "ECONNABORTED") return true;
  if (err.response.status >= 500) return true;
  if (err.response.status === 404) return true;
  return false;
}

// Returns true if the response body looks like a real API response (has an "ok" field).
// Vercel's SPA fallback returns HTML with status 200 — this catches that case.
function isValidApiResponse(data) {
  return typeof data === "object" && data !== null && "ok" in data;
}

export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/login", { username, password });
    if (!isValidApiResponse(res.data)) {
      // Got 200 but it's not our API — likely Vercel serving index.html
      return { ok: false, serverReachable: false, message: "Backend offline." };
    }
    return { ...res.data, serverReachable: true };
  } catch (err) {
    if (isServerDown(err)) {
      return { ok: false, serverReachable: false, message: "Backend offline." };
    }
    const message = err.response?.data?.message || "Invalid username or password.";
    return { ok: false, serverReachable: true, message };
  }
}

export async function getSettings(username) {
  try {
    const res = await api.get(`/settings/${encodeURIComponent(username)}`);
    if (!isValidApiResponse(res.data)) return null;
    return res.data;
  } catch (err) {
    if (isServerDown(err)) return null;
    console.error("[API] getSettings:", err.response?.data || err.message);
    return null;
  }
}

export async function saveSettings(username, settings) {
  try {
    await api.put(`/settings/${encodeURIComponent(username)}`, settings);
  } catch (err) {
    if (isServerDown(err)) return;
    console.error("[API] saveSettings:", err.response?.data || err.message);
  }
}

export async function getSymptoms(username) {
  try {
    const res = await api.get(`/symptoms/${encodeURIComponent(username)}`);
    if (typeof res.data !== "object" || res.data === null) return null;
    return res.data;
  } catch (err) {
    if (isServerDown(err)) return null;
    console.error("[API] getSymptoms:", err.response?.data || err.message);
    return null;
  }
}

export async function saveSymptom(username, date, symptomData) {
  try {
    await api.put(`/symptoms/${encodeURIComponent(username)}/${date}`, symptomData);
  } catch (err) {
    if (isServerDown(err)) return;
    console.error("[API] saveSymptom:", err.response?.data || err.message);
  }
}
