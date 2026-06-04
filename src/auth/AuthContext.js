import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/flowcareApi";

const AUTH_STORAGE_KEY = "flowcare_auth_session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /**
   * Session is kept in localStorage ONLY to persist "who is logged in"
   * across page refreshes — like a session cookie. The actual data (cycle
   * settings, symptoms) now lives in SQLite on the backend.
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
   * Login — calls the backend API which verifies against SQLite.
   * Returns { ok: true, username } on success or { ok: false, message } on failure.
   */
  const login = async (username, password) => {
    const result = await loginUser(username.trim(), password);
    if (result.ok) {
      setSession({ isAuthenticated: true, username: result.username });
    }
    return result;
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