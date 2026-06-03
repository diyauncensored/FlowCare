import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "./settingspage.css";

function SettingsPage({
  cycleLength,
  setCycleLength,
  periodLength,
  setPeriodLength,
  lastPeriod,
  setLastPeriod,
  theme,
  setTheme
}) {
  const { username } = useAuth();
  const [name, setName] = useState(() => localStorage.getItem("flowcare_userName") || "Diya");
  const [email, setEmail] = useState(() => localStorage.getItem("flowcare_userEmail") || "");
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("flowcare_notifications") !== "false";
  });
  const [password, setPassword] = useState("");

  const handleSave = () => {
    localStorage.setItem("flowcare_userName", name);
    localStorage.setItem("flowcare_userEmail", email);
    localStorage.setItem("flowcare_notifications", notifications.toString());
    alert("Settings synchronized successfully! Your cycle predictions have been recalibrated.");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="settings-page">
      {/* Page Header */}
      <header className="settings-header animate-fade-rise">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your preferences and cycle data.</p>
      </header>

      <div className="settings-grid">
        {/* Profile Card */}
        <section className="settings-card animate-fade-rise">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Profile</h2>
          </div>
          <div className="profile-summary">
            <div className="profile-avatar">
              <span className="profile-avatar-letter">
                {(username || name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="profile-info">
              <span className="profile-name">{username || name}</span>
              <span className="profile-meta">
                {cycleLength}-day cycle &middot; {periodLength}-day period
              </span>
            </div>
          </div>
          <div className="settings-form">
            <label className="settings-label">
              <span className="label-text">Display Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="settings-input"
              />
            </label>
            <label className="settings-label">
              <span className="label-text">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="settings-input"
                placeholder="you@example.com"
              />
            </label>
            <label className="settings-label">
              <span className="label-text">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                className="settings-input"
              />
            </label>
          </div>
        </section>

        {/* Cycle Data Card */}
        <section className="settings-card animate-fade-rise-delay">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Cycle Data</h2>
          </div>
          <div className="settings-form">
            <label className="settings-label">
              <span className="label-text">Cycle Length</span>
              <div className="range-display">
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
                  className="settings-range"
                />
                <span className="range-value">{cycleLength} days</span>
              </div>
              <span className="range-hint">Normal range: 24 &ndash; 35 days</span>
            </label>

            <label className="settings-label">
              <span className="label-text">Period Length</span>
              <div className="range-display">
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(parseInt(e.target.value, 10))}
                  className="settings-range"
                />
                <span className="range-value">{periodLength} days</span>
              </div>
              <span className="range-hint">Normal range: 3 &ndash; 7 days</span>
            </label>

            <label className="settings-label">
              <span className="label-text">Last Period Start</span>
              <input
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="settings-input"
              />
            </label>
          </div>
        </section>

        {/* Preferences Card — Full Width */}
        <section className="settings-card settings-card--full animate-fade-rise-delay-2">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Preferences</h2>
          </div>

          <div className="toggle-rows">
            <div className="toggle-row">
              <div className="toggle-info">
                <h3 className="toggle-label">Dark Mode</h3>
                <p className="toggle-description">
                  Switch between light and dark appearance.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <h3 className="toggle-label">Notifications</h3>
                <p className="toggle-description">
                  Receive reminders for period predictions and fertility alerts.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn-premium save-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
