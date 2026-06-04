import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./loginpage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(username, password);

    if (result.ok) {
      navigate(fromPath, { replace: true });
      return;
    }

    setError(result.message || "Login failed.");
    setIsSubmitting(false);
  };

  return (
    <div className="login-page">
      {/* Left — Brand Panel */}
      <section className="login-brand-panel animate-fade-rise">
        <div className="brand-panel-content">
          <span className="brand-label">Welcome to</span>
          <h1 className="brand-title">FlowCare</h1>
          <p className="brand-subtitle">
            Your personal cycle and wellness companion. 
            Track, understand, and care for your body with clarity.
          </p>
        </div>
      </section>

      {/* Right — Form Panel */}
      <section className="login-form-panel animate-fade-rise-delay">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-heading">Sign in</h2>
            <p className="login-subheading">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="demo@flowcare.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button type="submit" className="btn-premium login-submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          <div className="login-demo-hint">
            <span className="hint-label">Demo credentials</span>
            <p>Username: demo@flowcare.com</p>
            <p>Password: FlowCare123!</p>
          </div>

          <div className="login-footer">
            <Link to="/login" onClick={() => { setUsername(""); setPassword(""); setError(""); }}>
              Reset form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;