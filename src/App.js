import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/homepage"; // Your HomePage component
import CycleTrackerPage from "./pages/cycletrackerpage"; // Your CycleTrackerPage component
import SettingsPage from "./pages/settingspage"; // Your SettingsPage component
import TeamMembers from "./components/TeamMembers"; // Your TeamMembers component
import TalkHere from "./components/TalkHere"; // Import the TalkHere component
import Header from "./components/header"; // Your Header component

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/talk" element={<TalkHere />} /> {/* Route for Talk Here */}
        <Route path="/tracker" element={<CycleTrackerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<TeamMembers />} /> {/* Route for TeamMembers */}
      </Routes>
    </Router>
  );
}

export default App;