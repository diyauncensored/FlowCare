import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/homepage";
import CycleTrackerPage from "./pages/cycletrackerpage";
import SettingsPage from "./pages/settingspage";
import TalkHere from "./components/TalkHere";
import Header from "./components/header";
import SparkleTrail from "./components/SparkleTrail";
import FloatingOrbs from "./components/FloatingOrbs";
import "./App.css";

// Animated route wrapper — triggers fade-slide on route change
function AnimatedRoutes({
  cycleLength, setCycleLength,
  periodLength, setPeriodLength,
  lastPeriod, setLastPeriod,
  loggedSymptoms, setLoggedSymptoms,
  simulatedDay, setSimulatedDay,
  theme, setTheme
}) {
  const location = useLocation();

  return (
    <div className="route-transition-wrapper" key={location.pathname}>
      <Routes location={location}>
        <Route 
          path="/" 
          element={
            <HomePage 
              cycleLength={cycleLength}
              periodLength={periodLength}
              lastPeriod={lastPeriod}
              loggedSymptoms={loggedSymptoms}
              simulatedDay={simulatedDay}
              setSimulatedDay={setSimulatedDay}
            />
          } 
        />
        <Route 
          path="/talk" 
          element={
            <TalkHere 
              loggedSymptoms={loggedSymptoms}
              lastPeriod={lastPeriod}
              cycleLength={cycleLength}
              periodLength={periodLength}
            />
          } 
        />
        <Route 
          path="/tracker" 
          element={
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
          } 
        />
        <Route 
          path="/settings" 
          element={
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
          } 
        />
      </Routes>
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
      <div className="app-container">
        <SparkleTrail />
        <FloatingOrbs />
        <Header theme={theme} setTheme={setTheme} />
        <main className="app-main">
          <AnimatedRoutes
            cycleLength={cycleLength} setCycleLength={setCycleLength}
            periodLength={periodLength} setPeriodLength={setPeriodLength}
            lastPeriod={lastPeriod} setLastPeriod={setLastPeriod}
            loggedSymptoms={loggedSymptoms} setLoggedSymptoms={setLoggedSymptoms}
            simulatedDay={simulatedDay} setSimulatedDay={setSimulatedDay}
            theme={theme} setTheme={setTheme}
          />
        </main>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} FlowCare. Built with ❤️ </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;