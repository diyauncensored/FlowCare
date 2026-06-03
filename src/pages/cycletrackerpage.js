import React, { useState, useEffect } from "react";
import "./cycletrackerpage.css";

function CycleTrackerPage({
  cycleLength,
  setCycleLength,
  periodLength,
  setPeriodLength,
  lastPeriod,
  setLastPeriod,
  loggedSymptoms,
  setLoggedSymptoms
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [showLogger, setShowLogger] = useState(false);

  // Symptom Logger Form State
  const [flow, setFlow] = useState("");
  const [mood, setMood] = useState("");
  const [painList, setPainList] = useState([]);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(8);

  // Format a Date object to YYYY-MM-DD
  const formatDateStr = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Set initial selected date to today on load
  useEffect(() => {
    const todayStr = formatDateStr(new Date());
    setSelectedDateStr(todayStr);
  }, []);

  // Sync form state when selected date changes
  useEffect(() => {
    if (selectedDateStr) {
      const existing = loggedSymptoms[selectedDateStr] || {};
      setFlow(existing.flow || "");
      setMood(existing.mood || "");
      setPainList(existing.painList || []);
      setWater(existing.water || 0);
      setSleep(existing.sleep || 8);
    }
  }, [selectedDateStr, loggedSymptoms]);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Determine date metrics
  const getDateStatus = (day) => {
    if (!lastPeriod) return { isPeriod: false, isFertile: false, isOvulation: false };
    
    const targetDate = new Date(year, month, day);
    const lastPeriodDate = new Date(lastPeriod);
    
    // Set hours to zero for precise day calculations
    targetDate.setHours(0, 0, 0, 0);
    lastPeriodDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate - lastPeriodDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // In past before first tracked period. Backtrack predictions.
      const cyclesBack = Math.ceil(Math.abs(diffDays) / cycleLength);
      const alignedDiff = diffDays + (cyclesBack * cycleLength);
      const dayOfCycle = alignedDiff % cycleLength;
      
      const isPeriod = dayOfCycle < periodLength;
      const isOvulation = dayOfCycle === (cycleLength - 14);
      const isFertile = dayOfCycle >= (cycleLength - 19) && dayOfCycle <= (cycleLength - 14);
      return { isPeriod, isFertile, isOvulation };
    } else {
      const dayOfCycle = diffDays % cycleLength;
      const isPeriod = dayOfCycle < periodLength;
      const isOvulation = dayOfCycle === (cycleLength - 14);
      const isFertile = dayOfCycle >= (cycleLength - 19) && dayOfCycle <= (cycleLength - 14);
      return { isPeriod, isFertile, isOvulation };
    }
  };

  // Check if a day is in the future
  const isFutureDate = (day) => {
    const targetDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate > today;
  };

  // Handle day click
  const handleDayClick = (day) => {
    const targetDate = new Date(year, month, day);
    targetDate.setMinutes(targetDate.getMinutes() - targetDate.getTimezoneOffset()); // timezone offset fix
    const dateStr = formatDateStr(targetDate);
    setSelectedDateStr(dateStr);
    setShowLogger(true);
  };

  // Handle symptoms save
  const handleSaveLogs = () => {
    const newLogs = {
      ...loggedSymptoms,
      [selectedDateStr]: {
        flow,
        mood,
        painList,
        water,
        sleep
      }
    };
    setLoggedSymptoms(newLogs);
    alert(`Wellness metrics saved for ${selectedDateStr}!`);
  };

  // Clear symptoms for a date
  const handleClearLogs = () => {
    const newLogs = { ...loggedSymptoms };
    delete newLogs[selectedDateStr];
    setLoggedSymptoms(newLogs);
  };

  const togglePain = (symptom) => {
    if (painList.includes(symptom)) {
      setPainList(painList.filter(p => p !== symptom));
    } else {
      setPainList([...painList, symptom]);
    }
  };

  // Generate Calendar Grid
  const calendarCells = [];
  // Padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
  }
  // Active days
  for (let day = 1; day <= daysInMonth; day++) {
    const { isPeriod, isFertile, isOvulation } = getDateStatus(day);
    const cellDate = new Date(year, month, day);
    cellDate.setMinutes(cellDate.getMinutes() - cellDate.getTimezoneOffset());
    const cellDateStr = formatDateStr(cellDate);
    
    const isSelected = cellDateStr === selectedDateStr;
    const isToday = cellDateStr === formatDateStr(new Date());
    const hasLogs = loggedSymptoms[cellDateStr] ? true : false;
    const isFuture = isFutureDate(day);

    let dayClass = "";
    if (isPeriod) dayClass += " cal-day-period";
    if (isFertile) dayClass += " cal-day-fertile";
    if (isOvulation) dayClass += " cal-day-ovulation";
    if (isSelected) dayClass += " cal-day-selected";
    if (isToday) dayClass += " cal-day-today";
    if (isFuture) dayClass += " cal-day-future";

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        className={`cal-cell active-day ${dayClass}`}
        onClick={() => handleDayClick(day)}
      >
        <span className="cal-day-number">{day}</span>
        {isOvulation && <span className="cal-ovulation-heart">❤️</span>}
        {hasLogs && <span className="cal-log-dot"></span>}
      </div>
    );
  }

  return (
    <div className="tracker-page-container">

      {/* Page Header */}
      <section className="tracker-page-header animate-fade-rise">
        <h1 className="tracker-page-title">Cycle Tracker</h1>
        <p className="tracker-page-subtitle">
          Log symptoms, hydration, and sleep to refine your predictions.
        </p>
      </section>

      <div className="tracker-grid-layout">
        
        {/* Left Side: Calendar */}
        <div className="calendar-panel animate-fade-rise-delay">
          
          {/* Month Navigation */}
          <div className="cal-header-controls">
            <button className="cal-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">←</button>
            <h2 className="cal-month-title">{monthNames[month]} {year}</h2>
            <button className="cal-nav-btn" onClick={handleNextMonth} aria-label="Next month">→</button>
          </div>

          {/* Weekday Labels */}
          <div className="cal-weekday-labels">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="cal-days-grid">
            {calendarCells}
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <div className="legend-item">
              <span className="legend-dot dot-period"></span>
              <span>Period</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-fertile"></span>
              <span>Fertile Window</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-ovulation"></span>
              <span>Ovulation</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-log"></span>
              <span>Logged</span>
            </div>
          </div>

          {/* Cycle Calibrator */}
          <div className="cal-fast-settings">
            <h3>Cycle Settings</h3>
            <div className="fast-settings-row">
              <label>
                <span>Cycle Length</span>
                <input 
                  type="number" 
                  min="21" 
                  max="45" 
                  value={cycleLength} 
                  onChange={(e) => setCycleLength(parseInt(e.target.value, 10) || 28)}
                />
              </label>
              <label>
                <span>Period Duration</span>
                <input 
                  type="number" 
                  min="3" 
                  max="10" 
                  value={periodLength} 
                  onChange={(e) => setPeriodLength(parseInt(e.target.value, 10) || 5)}
                />
              </label>
              <label>
                <span>Last Period Start</span>
                <input 
                  type="date" 
                  value={lastPeriod} 
                  onChange={(e) => setLastPeriod(e.target.value)}
                />
              </label>
            </div>
          </div>

        </div>

        {/* Right Side: Symptom Logger */}
        <div className={`logger-panel ${showLogger ? "active-drawer" : ""} animate-fade-rise-delay-2`}>
          <div className="logger-header">
            <h2>Wellness Logger</h2>
            <p className="logger-target-date">
              {selectedDateStr ? new Date(selectedDateStr + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ""}
            </p>
          </div>

          <div className="logger-body-scroller">
            
            {/* Flow Intensity */}
            <div className="logger-group">
              <h3>Flow</h3>
              <div className="chips-row">
                {[
                  { label: "None", emoji: "⚪" },
                  { label: "Light", emoji: "🩸" },
                  { label: "Medium", emoji: "🩸" },
                  { label: "Heavy", emoji: "🩸" }
                ].map(option => (
                  <button 
                    key={option.label} 
                    className={`choice-chip ${flow === option.label ? "selected" : ""}`}
                    onClick={() => setFlow(option.label)}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="logger-group">
              <h3>Mood</h3>
              <div className="chips-row moods">
                {[
                  { name: "Happy", emoji: "😊" },
                  { name: "Calm", emoji: "🧘" },
                  { name: "Energetic", emoji: "⚡" },
                  { name: "Sensitive", emoji: "🥺" },
                  { name: "Tired", emoji: "😴" },
                  { name: "Moody", emoji: "🎭" }
                ].map(item => (
                  <button
                    key={item.name}
                    className={`choice-chip ${mood === item.name ? "selected" : ""}`}
                    onClick={() => setMood(item.name)}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Symptoms */}
            <div className="logger-group">
              <h3>Symptoms</h3>
              <div className="chips-row checkable">
                {["Cramps", "Headache", "Bloating", "Acne", "Backache", "Fatigue"].map(symptom => (
                  <button
                    key={symptom}
                    className={`choice-chip check-chip ${painList.includes(symptom) ? "selected" : ""}`}
                    onClick={() => togglePain(symptom)}
                  >
                    <span>{painList.includes(symptom) ? "✓" : "+"}</span>
                    <span>{symptom}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Water Intake */}
            <div className="logger-group">
              <div className="group-header-label">
                <h3>Water Intake</h3>
                <span className="value-metric">{water} mL</span>
              </div>
              <div className="water-stepper">
                <button className="stepper-btn" onClick={() => setWater(Math.max(0, water - 250))}>−</button>
                <div className="water-level-display">
                  <div className="water-level-fill" style={{ width: `${Math.min(100, (water / 2000) * 100)}%` }}></div>
                  <span className="water-inner-txt">Goal: 2000 mL</span>
                </div>
                <button className="stepper-btn" onClick={() => setWater(water + 250)}>+</button>
              </div>
            </div>

            {/* Sleep Duration */}
            <div className="logger-group">
              <div className="group-header-label">
                <h3>Sleep</h3>
                <span className="value-metric">{sleep} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="sleep-slider"
              />
            </div>

          </div>

          {/* Actions Footer */}
          <div className="logger-actions-footer">
            <button className="btn-premium save-logs-btn" onClick={handleSaveLogs}>
              Save Log
            </button>
            <button className="clear-logs-btn" onClick={handleClearLogs}>
              Clear
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CycleTrackerPage;