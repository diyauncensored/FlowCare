import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/flowcareApi";

const AUTH_STORAGE_KEY = "flowcare_auth_session";

// Fallback credentials used when the backend server is not reachable.
// These match the demo user seeded in the SQLite DB.
const FALLBACK_USERNAME = "demo@flowcare.com";
const FALLBACK_PASSWORD = "FlowCare123!";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /**
   * Session is kept in localStorage to persist who is logged in across
   * page refreshes. The actual data lives in SQLite when the backend is up.
   */
  const [session, setSession] = useState(() => {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return { isAuthenticated: false, username: "" };
    try {
      const parsed = JSON.parse(rawSession);
      return {
        isAuthenticated: Boolean(parsed.isAuthenticated),
        username: parsed.username || "",
      };
    } catch {
      return { isAuthenticated: false, username: "" };
    }
  });

  // Persist session to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  /**
   * Login strategy:
   *  1. Try the backend API (SQLite auth).
   *  2. If the backend is unreachable (network error), fall back to the
   *     hardcoded demo credentials so the app always works offline.
   */
  const login = async (username, password) => {
    const trimmedUsername = username.trim().toLowerCase();

    // ── Try API first ────────────────────────────────────────────────────────
    const result = await loginUser(trimmedUsername, password);

    if (result.ok) {
      setSession({ isAuthenticated: true, username: result.username });
      return { ok: true };
    }

    // ── If API returned a real auth error (wrong password), surface it ──────
    if (result.serverReachable) {
      return { ok: false, message: result.message };
    }

    // ── Backend is down — fall back to local credential check ────────────────
    console.warn("[Auth] Backend unreachable — using offline credential fallback.");
    if (
      trimmedUsername === FALLBACK_USERNAME &&
      password === FALLBACK_PASSWORD
    ) {
      setSession({ isAuthenticated: true, username: FALLBACK_USERNAME });
      return { ok: true };
    }

    return {
      ok: false,
      message: "Invalid username or password.",
    };
  };

  const logout = () => {
    setSession({ isAuthenticated: false, username: "" });
  };

  const value = {
    isAuthenticated: session.isAuthenticated,
    username: session.username,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}