import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || "Login failed. Please try again.";
    return { ok: false, message };
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
