import React, { useState } from "react";
import "./settingspage.css";

function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="settings-page">
      <h1 className="settings-heading">Settings</h1>
      <div className="settings-container">
        <div className="settings-group">
          <label>
            <span>Name:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <div className="settings-group">
          <label>
            <span>Email:</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <div className="settings-group">
          <label>
            <span>Notifications:</span>
            <select
              value={notifications}
              onChange={(e) => setNotifications(e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </div>
        <div className="settings-group">
          <label>
            <span>Theme:</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        <div className="settings-group">
          <label>
            <span>Change Password:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </label>
        </div>
        <button className="save-button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
