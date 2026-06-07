import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/login", { username, password });
    return { ...res.data, serverReachable: true };
  } catch (err) {
    // No response, 5xx, or 404 = backend isn't running (local dev)
    const status = err.response?.status;
    if (!err.response || status >= 500 || status === 404) {
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
    console.error("[API] getSettings:", err.response?.data || err.message);
    return null;
  }
}

export async function saveSettings(username, settings) {
  try {
    await api.put(`/settings/${encodeURIComponent(username)}`, settings);
  } catch (err) {
    console.error("[API] saveSettings:", err.response?.data || err.message);
  }
}

export async function getSymptoms(username) {
  try {
    const res = await api.get(`/symptoms/${encodeURIComponent(username)}`);
    return res.data;
  } catch (err) {
    console.error("[API] getSymptoms:", err.response?.data || err.message);
    return {};
  }
}

export async function saveSymptom(username, date, symptomData) {
  try {
    await api.put(`/symptoms/${encodeURIComponent(username)}/${date}`, symptomData);
  } catch (err) {
    console.error("[API] saveSymptom:", err.response?.data || err.message);
  }
}
