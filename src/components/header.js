import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./header.css";

function Header({ theme, setTheme }) {
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-header">
      <div className="header-logo">
        <Link to="/">
          <svg className="logo-droplet" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="url(#dropletGradient)"/>
            <defs>
              <linearGradient id="dropletGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF7B99" />
                <stop offset="1" stopColor="#FF3D64" />
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">FlowCare</span>
        </Link>
      </div>

      <nav className="header-nav">
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive("/") ? "active-link" : ""}>
              <span className="nav-text">Home</span>
            </Link>
          </li>
          <li>
            <Link to="/talk" className={isActive("/talk") ? "active-link" : ""}>
              <span className="nav-text">FlowBot</span>
            </Link>
          </li>
          <li>
            <Link to="/tracker" className={isActive("/tracker") ? "active-link" : ""}>
              <span className="nav-text">Tracker</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className={isActive("/settings") ? "active-link" : ""}>
              <span className="nav-text">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="header-actions">
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
