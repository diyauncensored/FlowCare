import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/homepage";
import CycleTrackerPage from "./pages/cycletrackerpage";
import SettingsPage from "./pages/settingspage";
import TalkHere from "./components/TalkHere";
import LoginPage from "./pages/loginpage";
import Header from "./components/header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./auth/AuthContext";

import FloatingOrbs from "./components/FloatingOrbs";
import "./App.css";

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

function App() {
  const [cycleLength, setCycleLength] = useState(() => {
    return parseInt(localStorage.getItem("flowcare_cycleLength") || "28", 10);
  });
  
  const [periodLength, setPeriodLength] = useState(() => {
    return parseInt(localStorage.getItem("flowcare_periodLength") || "5", 10);
  });

  const [lastPeriod, setLastPeriod] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 10);
    return localStorage.getItem("flowcare_lastPeriod") || defaultDate.toISOString().split('T')[0];
  });

  const [loggedSymptoms, setLoggedSymptoms] = useState(() => {
    const raw = localStorage.getItem("flowcare_loggedSymptoms");
    return raw ? JSON.parse(raw) : {};
  });

  const [simulatedDay, setSimulatedDay] = useState(1);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("flowcare_theme") || "light";
  });

  useEffect(() => {
    if (lastPeriod) {
      const today = new Date();
      const lastDate = new Date(lastPeriod);
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const calculatedDay = ((diffDays - 1) % cycleLength) + 1;
      setSimulatedDay(calculatedDay || 1);
    }
  }, [lastPeriod, cycleLength]);

  useEffect(() => {
    localStorage.setItem("flowcare_cycleLength", cycleLength.toString());
  }, [cycleLength]);

  useEffect(() => {
    localStorage.setItem("flowcare_periodLength", periodLength.toString());
  }, [periodLength]);

  useEffect(() => {
    localStorage.setItem("flowcare_lastPeriod", lastPeriod);
  }, [lastPeriod]);

  useEffect(() => {
    localStorage.setItem("flowcare_loggedSymptoms", JSON.stringify(loggedSymptoms));
  }, [loggedSymptoms]);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.remove("theme-dark");
    }
    localStorage.setItem("flowcare_theme", theme);
  }, [theme]);

  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;