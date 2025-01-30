import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function CycleCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div>
      <h2>Track Your Cycle</h2>
      <Calendar onChange={setDate} value={date} />
      <p>Selected date: {date.toDateString()}</p>
    </div>
  );
}

export default CycleCalendar;
