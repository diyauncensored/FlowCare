import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/flowcareApi";

const AUTH_STORAGE_KEY = "flowcare_auth_session";

// Offline fallback — matches the demo user seeded in the SQLite DB
const FALLBACK_USERNAME = "demo@flowcare.com";
const FALLBACK_PASSWORD = "FlowCare123!";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const login = async (username, password) => {
    const trimmedUsername = username.trim().toLowerCase();
    const result = await loginUser(trimmedUsername, password);

    if (result.ok) {
      setSession({ isAuthenticated: true, username: result.username });
      return { ok: true };
    }

    // If the server was reachable but rejected the credentials, surface its message
    if (result.serverReachable) {
      return { ok: false, message: result.message };
    }

    // Server is down — check against local fallback so the app still works offline
    console.warn("[Auth] Backend unreachable, using offline fallback.");
    if (trimmedUsername === FALLBACK_USERNAME && password === FALLBACK_PASSWORD) {
      setSession({ isAuthenticated: true, username: FALLBACK_USERNAME });
      return { ok: true };
    }

    return { ok: false, message: "Invalid username or password." };
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