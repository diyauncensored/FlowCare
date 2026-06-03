import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./header.css";

function Header({ theme, setTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-logo">
          <Link to="/">
            <svg className="logo-droplet" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="url(#dropletGrad)"/>
              <defs>
                <linearGradient id="dropletGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF8DA6" />
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
              <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/talk" className={isActive("/talk") ? "nav-link active" : "nav-link"}>
                FlowBot
              </Link>
            </li>
            <li>
              <Link to="/tracker" className={isActive("/tracker") ? "nav-link active" : "nav-link"}>
                Tracker
              </Link>
            </li>
            <li>
              <Link to="/settings" className={isActive("/settings") ? "nav-link active" : "nav-link"}>
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="header-user-chip" title={`Signed in as ${username}`}>
            <span className="user-name">{username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} type="button">
            Log out
          </button>
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      </div>
    </header>
  );
}

export default Header;
