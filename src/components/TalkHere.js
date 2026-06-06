import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./TalkHere.css";

const TalkHere = ({ loggedSymptoms, lastPeriod, cycleLength, periodLength }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hey there! I'm FlowBot, your wellness companion. I can help with cycle questions, cramp relief, nutrition tips, and more. How are you feeling today?",
      sender: "bot",
      time: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = loggedSymptoms[todayStr] || {};

  const getCurrentPhase = () => {
    if (!lastPeriod) return "Follicular Phase";
    const today = new Date();
    const lastDate = new Date(lastPeriod);
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength;

    if (cycleDay < periodLength) return "Menstruation";
    if (cycleDay <= 11) return "Follicular Phase";
    if (cycleDay <= 16) return "Ovulatory Phase";
    return "Luteal Phase";
  };

  const currentPhase = getCurrentPhase();

  const getSmartSuggestions = () => {
    const chips = [];

    if (todayLogs.painList?.includes("Cramps")) {
      chips.push("How can I relieve cramps today?");
    }

    if (todayLogs.water && todayLogs.water < 1000) {
      chips.push("Why is hydration critical right now?");
    }

    chips.push(`Recipe ideas for my ${currentPhase}`);
    chips.push("Tips to sleep better during my cycle");
    chips.push("Gentle exercises for menstrual fatigue");

    return [...new Set(chips)].slice(0, 3);
  };

  const smartChips = getSmartSuggestions();

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend(inputValue);
    }
  };

  const handleChipClick = (chipText) => {
    const query = chipText
      .replace(
        /[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g,
        ""
      )
      .trim();
    handleSend(query);
  };

  const handleSend = async (textToSend) => {
    if (!textToSend || textToSend.trim() === "") return;

    const userMessage = { text: textToSend, sender: "user", time: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      // Build cycle context for the AI
      const cycleContext = {
        phase: currentPhase,
        symptoms: todayLogs.painList?.join(", ") || "none logged",
        water: todayLogs.water || 0,
        mood: todayLogs.mood || "not logged",
      };

      // Send conversation history to the server-side Gemini endpoint
      const res = await axios.post("/api/flowbot", {
        messages: updatedMessages.map((m) => ({
          text: m.text,
          sender: m.sender,
        })),
        cycleContext,
      });

      const botText = res.data.ok
        ? res.data.response
        : res.data.message || "Sorry, something went wrong. Please try again.";

      setMessages([
        ...updatedMessages,
        { text: botText, sender: "bot", time: new Date() },
      ]);
    } catch (error) {
      console.error("FlowBot error:", error);
      setMessages([
        ...updatedMessages,
        {
          text: "I'm having a little trouble connecting right now. Please try again in a moment.",
          sender: "bot",
          time: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-page animate-fade-rise">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6z"
                fill="currentColor"
                opacity="0.15"
              />
              <path
                d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              <path
                d="M12 14c-2.5 0-4.5 1.2-4.5 2.8V18h9v-1.2c0-1.6-2-2.8-4.5-2.8z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="chat-header-text">
            <h2 className="chat-header-title">FlowBot</h2>
            <p className="chat-header-subtitle">
              <span className="status-dot"></span>
              Your wellness companion
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${
                message.sender === "user" ? "message-row--user" : "message-row--bot"
              }`}
            >
              <div className="message-bubble">
                <p className="message-text">{message.text}</p>
                {message.time && (
                  <span className="message-time">{formatTime(message.time)}</span>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-row message-row--bot">
              <div className="message-bubble typing-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="chat-chips">
          {smartChips.map((chipText, i) => (
            <button
              key={i}
              className="chip-btn"
              onClick={() => handleChipClick(chipText)}
            >
              {chipText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="Ask about cramps, diet, sleep..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="chat-input"
          />
          <button
            onClick={() => handleSend(inputValue)}
            className="chat-send-btn"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalkHere;