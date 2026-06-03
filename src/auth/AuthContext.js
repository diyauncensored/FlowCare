import React, { createContext, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "flowcare_auth_session";
const DEFAULT_USERNAME = process.env.REACT_APP_LOGIN_USERNAME || "demo@flowcare.com";
const DEFAULT_PASSWORD = process.env.REACT_APP_LOGIN_PASSWORD || "FlowCare123!";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
      return { isAuthenticated: false, username: "" };
    }

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
    const normalizedUsername = username.trim();

    if (normalizedUsername === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setSession({ isAuthenticated: true, username: normalizedUsername });
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
    defaultUsername: DEFAULT_USERNAME,
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