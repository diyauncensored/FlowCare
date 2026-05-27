import React, { useState } from "react";
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
    <div className="settings-page-wrapper">
      <section className="settings-intro">
        <h1 className="glass-header-title">System Settings</h1>
        <p className="glass-subtitle">Configure your biological coordinates and personalize your dashboard themes.</p>
      </section>

      <div className="settings-grid-container">
        
        {/* Profile Card */}
        <div className="settings-card glass-card">
          <div className="card-header-icon">👤</div>
          <h2>User Profile</h2>
          <div className="form-column">
            <label className="form-label-item">
              <span>Display Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
              />
            </label>
            <label className="form-label-item">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
              />
            </label>
            <label className="form-label-item">
              <span>Change Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="glass-input"
              />
            </label>
          </div>
        </div>

        {/* Cycle Metrics Configurations */}
        <div className="settings-card glass-card">
          <div className="card-header-icon">🧬</div>
          <h2>Cycle Coordinates</h2>
          <div className="form-column">
            <label className="form-label-item">
              <span>Cycle Duration: <strong>{cycleLength} Days</strong></span>
              <input
                type="range"
                min="21"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
                className="theme-gradient-slider"
              />
              <span className="slider-limits-sub">Normal: 24 - 35 days</span>
            </label>
            
            <label className="form-label-item">
              <span>Period Length: <strong>{periodLength} Days</strong></span>
              <input
                type="range"
                min="3"
                max="10"
                value={periodLength}
                onChange={(e) => setPeriodLength(parseInt(e.target.value, 10))}
                className="theme-gradient-slider"
              />
              <span className="slider-limits-sub">Normal: 3 - 7 days</span>
            </label>

            <label className="form-label-item">
              <span>Latest Period Start Date</span>
              <input
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="glass-input date-input"
              />
            </label>
          </div>
        </div>

        {/* System & Aesthetic Toggles */}
        <div className="settings-card glass-card full-width-card">
          <div className="card-header-icon">🎨</div>
          <h2>System Customization</h2>
          
          <div className="toggles-grid-row">
            
            <div className="toggle-item-row">
              <div className="toggle-text-col">
                <h3>Vibrant Dark Mode</h3>
                <p>Switch between the soft-rose aesthetic and rich dark theme.</p>
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

            <div className="toggle-item-row">
              <div className="toggle-text-col">
                <h3>Push Notifications</h3>
                <p>Receive reminders for period arrivals and peak fertility alerts.</p>
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

          <div className="settings-actions-footer">
            <button className="btn-premium save-settings-btn" onClick={handleSave}>
              <span>Apply Changes</span>
              <span>⚡</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
