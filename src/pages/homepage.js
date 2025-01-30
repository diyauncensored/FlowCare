import React from "react";
import "./homepage.css";
import cycleTrackingIcon from "./images/cycle-tracking.svg";
import moodTrackingIcon from "./images/mood-tracking.jpeg";
import healthTipsIcon from "./images/health-tips.jpeg";

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero-section">
        <h1>Welcome to FlowCare</h1>
        <p>Your ultimate companion for menstrual cycle and health tracking.</p>
        <button className="get-started-btn">Get Started</button>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose FlowCare?</h2>
        <div className="features">
          <div className="feature-card">
            <img
              src={cycleTrackingIcon}
              alt="Cycle Tracking"
              className="feature-icon"
            />
            <h3>Track Your Cycle</h3>
            <p>Stay informed about your menstrual cycle and ovulation dates.</p>
          </div>
          <div className="feature-card">
            <img
              src={moodTrackingIcon}
              alt="Mood Tracking"
              className="feature-icon"
            />
            <h3>Monitor Your Mood</h3>
            <p>Understand your mood patterns and emotional health better.</p>
          </div>
          <div className="feature-card">
            <img
              src={healthTipsIcon}
              alt="Health Tips"
              className="feature-icon"
            />
            <h3>Personalized Health Tips</h3>
            <p>Get tips on nutrition, exercise, and overall well-being.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Take Control of Your Health?</h2>
        <button className="cta-btn">Join Now</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} FlowCare. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;