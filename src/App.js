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

function getDefaultLastPeriod() {
  const d = new Date();
  d.setDate(d.getDate() - 10);
  return d.toISOString().split("T")[0];
}

function calcSimulatedDay(lastPeriod, cycleLength) {
  if (!lastPeriod) return 1;
  const today = new Date();
  const lastDate = new Date(lastPeriod);
  const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
  return ((diffDays - 1) % cycleLength) + 1 || 1;
}

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

// AppData sits inside AuthProvider so it can read the logged-in username
function AppData({ theme, setTheme }) {
  const { isAuthenticated, username } = useAuth();

  const [cycleLength, setCycleLengthState] = useState(28);
  const [periodLength, setPeriodLengthState] = useState(5);
  const [lastPeriod, setLastPeriodState] = useState(getDefaultLastPeriod());
  const [loggedSymptoms, setLoggedSymptoms] = useState({});
  const [simulatedDay, setSimulatedDay] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load user data from Turso on login
  useEffect(() => {
    if (!isAuthenticated || !username) {
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

        if (settings) {
          setCycleLengthState(settings.cycleLength ?? 28);
          setPeriodLengthState(settings.periodLength ?? 5);
          setLastPeriodState(settings.lastPeriod || getDefaultLastPeriod());
        }

        setLoggedSymptoms(symptoms || {});
      } catch (err) {
        console.error("[App] Failed to load user data:", err);
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    }

    loadUserData();
    return () => { cancelled = true; };
  }, [isAuthenticated, username]);

  useEffect(() => {
    setSimulatedDay(calcSimulatedDay(lastPeriod, cycleLength));
  }, [lastPeriod, cycleLength]);

  const persistSettings = useCallback(async (cl, pl, lp) => {
    if (!isAuthenticated || !username || !dataLoaded) return;
    await saveSettings(username, { cycleLength: cl, periodLength: pl, lastPeriod: lp });
  }, [isAuthenticated, username, dataLoaded]);

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

  // Theme is a UI preference — localStorage only
  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
    localStorage.setItem("flowcare_theme", theme);
  }, [theme]);

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