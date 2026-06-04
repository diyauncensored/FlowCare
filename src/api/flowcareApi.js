import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Treats the error as "server is down" if there's no response, if it timed out,
// or if the CRA proxy returned a 5xx HTML page (which happens when Express isn't running).
function isServerDown(err) {
  if (!err.response) return true;
  if (err.code === "ECONNABORTED") return true;
  if (err.response.status >= 500) return true;
  return false;
}

export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/login", { username, password });
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
