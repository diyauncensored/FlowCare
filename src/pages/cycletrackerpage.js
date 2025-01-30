import React, { useState } from "react";
import "./cycletrackerpage.css";
import cycleTrackingImage from "./images/cycle-tracking.svg"; // Import the image

function CycleTrackerPage() {
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriod, setLastPeriod] = useState("");

  // Calculate next period date
  const calculateNextPeriod = () => {
    if (!lastPeriod) return "Please enter a date.";
    const lastDate = new Date(lastPeriod);
    lastDate.setDate(lastDate.getDate() + parseInt(cycleLength, 10));
    return lastDate.toDateString();
  };

  // Calculate ovulation date (assumes ovulation occurs 14 days before the next period)
  const calculateOvulationDate = () => {
    if (!lastPeriod) return "Please enter a date.";
    const lastDate = new Date(lastPeriod);
    const ovulationDate = new Date(lastDate);
    ovulationDate.setDate(lastDate.getDate() + parseInt(cycleLength, 10) - 14);
    return ovulationDate.toDateString();
  };

  return (
    <div className="tracker-page">
      <h1 className="tracker-heading">Cycle Tracker</h1>
      <div className="tracker-container">
        {/* Input for Last Period */}
        <div className="tracker-input">
          <label>
            <span>Last Period:</span>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
            />
          </label>
        </div>

        {/* Input for Cycle Length */}
        <div className="tracker-input">
          <label>
            <span>Cycle Length (days):</span>
            <input
              type="number"
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
            />
          </label>
        </div>

        {/* Display Next Period */}
        <div className="tracker-result">
          <p>
            <strong>Next Period:</strong> {calculateNextPeriod()}
          </p>
        </div>

        {/* Display Ovulation Date */}
        <div className="tracker-result">
          <p>
            <strong>Estimated Ovulation Date:</strong> {calculateOvulationDate()}
          </p>
        </div>
      </div>

      {/* Image Container */}
      <div className="tracker-image-container">
        <img
          src={cycleTrackingImage}
          alt="Cycle Tracking"
          className="cycle-tracking"
        />
      </div>
    </div>
  );
}

export default CycleTrackerPage;