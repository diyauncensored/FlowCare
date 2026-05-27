import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTilt } from "../hooks/useTilt";
import "./homepage.css";
import cycleTrackingIcon from "./images/cycle-tracking.svg";
import moodTrackingIcon from "./images/mood-tracking.jpeg";
import healthTipsIcon from "./images/health-tips.jpeg";

// Curated affirmations
const AFFIRMATIONS = [
  "Your body is powerful and wise ✨",
  "Rest is not laziness — it's recovery 🌙",
  "You deserve gentleness today 🌸",
  "Every phase of your cycle has its own strength 💪",
  "Nourish yourself — you are worth it 🍵",
  "Your feelings are valid, always 💜",
  "Slow progress is still progress 🦋",
  "You are more than your symptoms 🌟",
  "Breathe deeply — this moment is yours 🧘",
  "Your cycle is your superpower 🔮",
  "Be patient with yourself today 🌷",
  "You radiate strength in every phase 💫",
];

function TiltCard({ children, className }) {
  const { tiltRef, tiltHandlers } = useTilt({ maxTilt: 8 });
  return (
    <div ref={tiltRef} {...tiltHandlers} className={className}>
      {children}
    </div>
  );
}

function HomePage({ cycleLength, periodLength, lastPeriod, loggedSymptoms, simulatedDay, setSimulatedDay }) {
  
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const todayStr = getTodayString();
  const todayLogs = loggedSymptoms[todayStr];

  // Compute insights from all logged data
  const insights = useMemo(() => {
    const entries = Object.entries(loggedSymptoms);
    const totalDaysLogged = entries.length;
    
    // Most common mood
    const moodCounts = {};
    let totalWater = 0;
    let waterDays = 0;
    entries.forEach(([, data]) => {
      if (data.mood) {
        moodCounts[data.mood] = (moodCounts[data.mood] || 0) + 1;
      }
      if (data.water) {
        totalWater += data.water;
        waterDays++;
      }
    });
    
    const topMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || "—";
    const avgWater = waterDays > 0 ? Math.round(totalWater / waterDays) : 0;
    
    // Streak: consecutive days ending at today
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (loggedSymptoms[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { totalDaysLogged, topMood, avgWater, streak };
  }, [loggedSymptoms]);

  // Cycle phase details
  const getCycleDetails = (day) => {
    if (day <= periodLength) {
      return {
        phase: "Menstruation",
        description: "Your period is here",
        chance: "Very Low Chance of Conception",
        colorClass: "phase-menstruation",
        glowColor: "rgba(255, 61, 100, 0.4)",
        strokeColor: "#FF3D64",
        tipTitle: "Self-Care & Comfort",
        tipText: "Prioritize warm herbal tea, gentle stretches, and cozy rest. Your body is shedding its lining; honor its request to slow down."
      };
    } else if (day <= 11) {
      return {
        phase: "Follicular Phase",
        description: "Your estrogen is rising",
        chance: "Low to Medium Conception Chance",
        colorClass: "phase-follicular",
        glowColor: "rgba(255, 142, 83, 0.4)",
        strokeColor: "#FF8E53",
        tipTitle: "Planning & Creativity",
        tipText: "Hormone increases boost energy and clarity. A perfect phase for networking, setting goals, starting projects, and intense workouts!"
      };
    } else if (day <= 16) {
      return {
        phase: "Ovulatory Phase",
        description: "Peak fertility window",
        chance: "High Chance of Conception (Ovulation)",
        colorClass: "phase-ovulatory",
        glowColor: "rgba(152, 77, 255, 0.4)",
        strokeColor: "#984DFF",
        tipTitle: "Vitality & Socializing",
        tipText: "Peak luteinizing hormone boosts communication and confidence. Ideal for public speaking, socializing, and celebrating milestones!"
      };
    } else {
      return {
        phase: "Luteal Phase",
        description: "Progesterone is peaking",
        chance: "Low Chance of Conception",
        colorClass: "phase-luteal",
        glowColor: "rgba(255, 94, 180, 0.4)",
        strokeColor: "#FF5EB4",
        tipTitle: "Nourishment & Grounding",
        tipText: "Body prepares for rest. Cravings or mood changes are natural. Enjoy comforting warm meals, focus on recovery, and get extra sleep."
      };
    }
  };

  const details = getCycleDetails(simulatedDay);

  const radius = 125;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (simulatedDay / cycleLength) * circumference;

  return (
    <div className="home-container">
      {/* Hero Header Section */}
      <section className="home-hero">
        <h1 className="hero-logo-glow">FlowCare</h1>
        <p className="hero-subtitle">Your personalized companion for menstrual wellness and cycle tracking.</p>
      </section>

      {/* Affirmation Marquee */}
      <section className="affirmation-marquee">
        <div className="marquee-track">
          {/* Duplicate for seamless loop */}
          {[...AFFIRMATIONS, ...AFFIRMATIONS].map((text, i) => (
            <span key={i} className="affirmation-item">{text}</span>
          ))}
        </div>
      </section>

      {/* Main Interactive Dial Widget */}
      <section className="dial-section">
        <div className="dial-glow-wrapper" style={{ boxShadow: `0 0 50px -10px ${details.glowColor}` }}>
          <div className="dial-card glass-card">
            
            <div className="svg-dial-container">
              <svg className="svg-dial-ring" width="300" height="300">
                <circle
                  className="dial-ring-bg"
                  cx="150"
                  cy="150"
                  r={radius}
                  strokeWidth="12"
                />
                <circle
                  className="dial-ring-fill"
                  cx="150"
                  cy="150"
                  r={radius}
                  strokeWidth="12"
                  stroke={details.strokeColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              
              <div className="dial-content">
                <span className={`phase-badge ${details.colorClass}`}>{details.phase}</span>
                <span className="dial-day-num">Day {simulatedDay}</span>
                <span className="dial-day-total">of {cycleLength} days</span>
                <p className="dial-chance">{details.chance}</p>
              </div>
            </div>

            <div className="slider-control-panel">
              <div className="slider-label-row">
                <span>Cycle Day Slider (Preview phases)</span>
                <span className="current-sim-label">Day {simulatedDay}</span>
              </div>
              <input
                type="range"
                min="1"
                max={cycleLength}
                value={simulatedDay}
                onChange={(e) => setSimulatedDay(parseInt(e.target.value, 10))}
                className="theme-gradient-slider"
              />
              <div className="slider-limits">
                <span>Day 1</span>
                <span>Day {cycleLength}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tips-card-wrapper">
          <div className="tip-card glass-card">
            <div className="tip-header-row">
              <span className="tip-icon">💡</span>
              <div>
                <h4 className="tip-phase-indicator">Wellness Tip • {details.phase}</h4>
                <h3 className="tip-title">{details.tipTitle}</h3>
              </div>
            </div>
            <p className="tip-body">{details.tipText}</p>
          </div>
          
          <div className="today-logs-card glass-card">
            <h3>Today's Wellness Record</h3>
            {todayLogs ? (
              <div className="logs-summary-grid">
                {todayLogs.flow && (
                  <div className="log-summary-item">
                    <span className="summary-emoji">🩸</span>
                    <div>
                      <p className="item-title">Flow</p>
                      <p className="item-val">{todayLogs.flow}</p>
                    </div>
                  </div>
                )}
                {todayLogs.mood && (
                  <div className="log-summary-item">
                    <span className="summary-emoji">😊</span>
                    <div>
                      <p className="item-title">Mood</p>
                      <p className="item-val">{todayLogs.mood}</p>
                    </div>
                  </div>
                )}
                {todayLogs.water && (
                  <div className="log-summary-item">
                    <span className="summary-emoji">💧</span>
                    <div>
                      <p className="item-title">Hydration</p>
                      <p className="item-val">{todayLogs.water} mL</p>
                    </div>
                  </div>
                )}
                {todayLogs.sleep && (
                  <div className="log-summary-item">
                    <span className="summary-emoji">💤</span>
                    <div>
                      <p className="item-title">Sleep</p>
                      <p className="item-val">{todayLogs.sleep} hrs</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-logs-state">
                <p>You haven't logged any health events today.</p>
                <Link to="/tracker" className="btn-premium">
                  <span>Log Symptoms</span>
                  <span>➕</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cycle Insights Analytics */}
      <section className="insights-section">
        <h2 className="section-title">Your Cycle Insights</h2>
        <div className="insights-grid stagger-enter">
          <TiltCard className="insight-mini-card glass-card">
            <span className="insight-icon">📊</span>
            <span className="insight-value">{insights.totalDaysLogged}</span>
            <span className="insight-label">Days Logged</span>
          </TiltCard>
          <TiltCard className="insight-mini-card glass-card">
            <span className="insight-icon">😊</span>
            <span className="insight-value">{insights.topMood}</span>
            <span className="insight-label">Top Mood</span>
          </TiltCard>
          <TiltCard className="insight-mini-card glass-card">
            <span className="insight-icon">💧</span>
            <span className="insight-value">{insights.avgWater}<small>mL</small></span>
            <span className="insight-label">Avg. Water</span>
          </TiltCard>
          <TiltCard className="insight-mini-card glass-card">
            <span className="insight-icon">🔥</span>
            <span className="insight-value">{insights.streak}</span>
            <span className="insight-label">Day Streak</span>
          </TiltCard>
        </div>
      </section>

      {/* Futuristic Features Section */}
      <section className="features-grid-section">
        <h2 className="section-title">Core Wellness Features</h2>
        <div className="features-container stagger-enter">
          <TiltCard className="feature-glow-card glass-card">
            <img src={cycleTrackingIcon} alt="Cycle Tracking" className="feature-icon-media" />
            <h3>Cycle Analysis</h3>
            <p>Predict accurate period arrival, peak fertility schedules, and hormonal shifts.</p>
          </TiltCard>
          <TiltCard className="feature-glow-card glass-card">
            <img src={moodTrackingIcon} alt="Mood Tracking" className="feature-icon-media" />
            <h3>Mood & Habits</h3>
            <p>Understand physical patterns and how estrogen affects stress and emotional balances.</p>
          </TiltCard>
          <TiltCard className="feature-glow-card glass-card">
            <img src={healthTipsIcon} alt="Health Tips" className="feature-icon-media" />
            <h3>Holographic AI</h3>
            <p>Talk with our intelligent chat model about symptoms, pain relief, and customized wellness.</p>
          </TiltCard>
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="cta-glass-banner glass-card">
        <h2>Start Monitoring Your Health Metrics</h2>
        <p>Unlock custom cycle predictions and track over 20 symptoms today.</p>
        <Link to="/tracker" className="btn-premium">
          <span>Go to Tracker</span>
          <span>➡️</span>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;