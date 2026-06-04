import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/homepage";
import CycleTrackerPage from "./pages/cycletrackerpage";
import SettingsPage from "./pages/settingspage";
import TalkHere from "./components/TalkHere";
import LoginPage from "./pages/loginpage";
import Header from "./components/header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { getSettings, saveSettings, getSymptoms } from "./api/flowcareApi";

import FloatingOrbs from "./components/FloatingOrbs";
import "./App.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultLastPeriod() {
  const d = new Date();
  d.setDate(d.getDate() - 10);
  return d.toISOString().split("T")[0];
}

function calcSimulatedDay(lastPeriod, cycleLength) {
  if (!lastPeriod) return 1;
  const today = new Date();
  const lastDate = new Date(lastPeriod);
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return ((diffDays - 1) % cycleLength) + 1 || 1;
}

// ─── Route tree ───────────────────────────────────────────────────────────────

function AppRoutes({
  cycleLength, setCycleLength,
  periodLength, setPeriodLength,
  lastPeriod, setLastPeriod,
  loggedSymptoms, setLoggedSymptoms,
  simulatedDay, setSimulatedDay,
  theme, setTheme,
}) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="route-transition-wrapper" key={location.pathname}>
      <Routes location={location}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage
                cycleLength={cycleLength}
                periodLength={periodLength}
                lastPeriod={lastPeriod}
                loggedSymptoms={loggedSymptoms}
                simulatedDay={simulatedDay}
                setSimulatedDay={setSimulatedDay}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talk"
          element={
            <ProtectedRoute>
              <TalkHere
                loggedSymptoms={loggedSymptoms}
                lastPeriod={lastPeriod}
                cycleLength={cycleLength}
                periodLength={periodLength}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <CycleTrackerPage
                cycleLength={cycleLength}
                setCycleLength={setCycleLength}
                periodLength={periodLength}
                setPeriodLength={setPeriodLength}
                lastPeriod={lastPeriod}
                setLastPeriod={setLastPeriod}
                loggedSymptoms={loggedSymptoms}
                setLoggedSymptoms={setLoggedSymptoms}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage
                cycleLength={cycleLength}
                setCycleLength={setCycleLength}
                periodLength={periodLength}
                setPeriodLength={setPeriodLength}
                lastPeriod={lastPeriod}
                setLastPeriod={setLastPeriod}
                theme={theme}
                setTheme={setTheme}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

function AppShell({
  cycleLength, setCycleLength,
  periodLength, setPeriodLength,
  lastPeriod, setLastPeriod,
  loggedSymptoms, setLoggedSymptoms,
  simulatedDay, setSimulatedDay,
  theme, setTheme,
}) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="app-container">
      <FloatingOrbs />
      {isAuthenticated && !isLoginPage && <Header theme={theme} setTheme={setTheme} />}
      <main className={`app-main${isLoginPage ? " app-main--auth" : ""}`}>
        <AppRoutes
          cycleLength={cycleLength}
          setCycleLength={setCycleLength}
          periodLength={periodLength}
          setPeriodLength={setPeriodLength}
          lastPeriod={lastPeriod}
          setLastPeriod={setLastPeriod}
          loggedSymptoms={loggedSymptoms}
          setLoggedSymptoms={setLoggedSymptoms}
          simulatedDay={simulatedDay}
          setSimulatedDay={setSimulatedDay}
          theme={theme}
          setTheme={setTheme}
        />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} FlowCare. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ─── Data manager — lives inside AuthProvider so it can read username ─────────

function AppData({ theme, setTheme }) {
  const { isAuthenticated, username } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────────
  const [cycleLength, setCycleLengthState] = useState(28);
  const [periodLength, setPeriodLengthState] = useState(5);
  const [lastPeriod, setLastPeriodState] = useState(getDefaultLastPeriod());
  const [loggedSymptoms, setLoggedSymptoms] = useState({});
  const [simulatedDay, setSimulatedDay] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── Load data from SQLite (with localStorage fallback) when user logs in ──────
  useEffect(() => {
    if (!isAuthenticated || !username) {
      // Reset to defaults on logout
      setCycleLengthState(28);
      setPeriodLengthState(5);
      setLastPeriodState(getDefaultLastPeriod());
      setLoggedSymptoms({});
      setSimulatedDay(1);
      setDataLoaded(false);
      return;
    }

    let cancelled = false;

    async function loadUserData() {
      try {
        const [settings, symptoms] = await Promise.all([
          getSettings(username),
          getSymptoms(username),
        ]);

        if (cancelled) return;

        // Settings: use API result, fall back to localStorage, then defaults
        if (settings) {
          setCycleLengthState(settings.cycleLength ?? 28);
          setPeriodLengthState(settings.periodLength ?? 5);
          setLastPeriodState(settings.lastPeriod || getDefaultLastPeriod());
        } else {
          // Backend offline — load from localStorage
          const cl = parseInt(localStorage.getItem("flowcare_cycleLength") || "28", 10);
          const pl = parseInt(localStorage.getItem("flowcare_periodLength") || "5", 10);
          const lp = localStorage.getItem("flowcare_lastPeriod") || getDefaultLastPeriod();
          setCycleLengthState(cl);
          setPeriodLengthState(pl);
          setLastPeriodState(lp);
        }

        // Symptoms: use API result, fall back to localStorage
        if (symptoms !== null) {
          setLoggedSymptoms(symptoms);
        } else {
          const raw = localStorage.getItem("flowcare_loggedSymptoms");
          setLoggedSymptoms(raw ? JSON.parse(raw) : {});
        }
      } catch (err) {
        console.error("[App] Failed to load user data:", err);
        // Hard fallback to localStorage on any unexpected error
        const cl = parseInt(localStorage.getItem("flowcare_cycleLength") || "28", 10);
        const pl = parseInt(localStorage.getItem("flowcare_periodLength") || "5", 10);
        const lp = localStorage.getItem("flowcare_lastPeriod") || getDefaultLastPeriod();
        const raw = localStorage.getItem("flowcare_loggedSymptoms");
        if (!cancelled) {
          setCycleLengthState(cl);
          setPeriodLengthState(pl);
          setLastPeriodState(lp);
          setLoggedSymptoms(raw ? JSON.parse(raw) : {});
        }
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    }

    loadUserData();
    return () => { cancelled = true; };
  }, [isAuthenticated, username]);

  // ── Recalculate simulated day when relevant settings change ──────────────────
  useEffect(() => {
    setSimulatedDay(calcSimulatedDay(lastPeriod, cycleLength));
  }, [lastPeriod, cycleLength]);

  // ── Persist settings to SQLite + localStorage whenever they change ───────────
  const persistSettings = useCallback(async (cl, pl, lp) => {
    if (!isAuthenticated || !username || !dataLoaded) return;
    // Always write to localStorage as backup (works offline)
    localStorage.setItem("flowcare_cycleLength", String(cl));
    localStorage.setItem("flowcare_periodLength", String(pl));
    localStorage.setItem("flowcare_lastPeriod", lp);
    // Also try to save to SQLite (no-ops silently if backend is down)
    await saveSettings(username, { cycleLength: cl, periodLength: pl, lastPeriod: lp });
  }, [isAuthenticated, username, dataLoaded]);

  // Wrapped setters that update state AND persist to DB
  const setCycleLength = useCallback((val) => {
    setCycleLengthState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      persistSettings(next, periodLength, lastPeriod);
      return next;
    });
  }, [persistSettings, periodLength, lastPeriod]);

  const setPeriodLength = useCallback((val) => {
    setPeriodLengthState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      persistSettings(cycleLength, next, lastPeriod);
      return next;
    });
  }, [persistSettings, cycleLength, lastPeriod]);

  const setLastPeriod = useCallback((val) => {
    setLastPeriodState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      persistSettings(cycleLength, periodLength, next);
      return next;
    });
  }, [persistSettings, cycleLength, periodLength]);

  // ── Theme — still uses localStorage (UI preference only) ────────────────────
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.remove("theme-dark");
    }
    localStorage.setItem("flowcare_theme", theme);
  }, [theme]);

  // ── Loading screen while data fetches from DB ────────────────────────────────
  if (isAuthenticated && !dataLoaded) {
    return (
      <div className="app-loading">
        <p>Loading your data…</p>
      </div>
    );
  }

  return (
    <AppShell
      cycleLength={cycleLength}
      setCycleLength={setCycleLength}
      periodLength={periodLength}
      setPeriodLength={setPeriodLength}
      lastPeriod={lastPeriod}
      setLastPeriod={setLastPeriod}
      loggedSymptoms={loggedSymptoms}
      setLoggedSymptoms={setLoggedSymptoms}
      simulatedDay={simulatedDay}
      setSimulatedDay={setSimulatedDay}
      theme={theme}
      setTheme={setTheme}
    />
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("flowcare_theme") || "light";
  });

  return (
    <Router>
      <AuthProvider>
        <AppData theme={theme} setTheme={setTheme} />
      </AuthProvider>
    </Router>
  );
}

export default App;