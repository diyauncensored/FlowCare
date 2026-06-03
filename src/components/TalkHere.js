import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./TalkHere.css";

const TalkHere = ({ loggedSymptoms, lastPeriod, cycleLength, periodLength }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am FlowBot, your AI wellness companion. I can help analyze your symptoms, suggest phase-appropriate nutrition, and offer exercise guides. How are you feeling today?",
      sender: "bot",
      time: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Gemini API configuration
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || null;
  const GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL || null;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Generate date strings
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const todayStr = getTodayString();
  const todayLogs = loggedSymptoms[todayStr] || {};

  // Determine current simulated phase for context
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

  // Create customized smart suggestion chips
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

    const updatedMessages = [
      ...messages,
      { text: textToSend, sender: "user", time: new Date() }
    ];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponse = await callGeminiAPI(textToSend);
      setMessages([
        ...updatedMessages,
        { text: botResponse, sender: "bot", time: new Date() }
      ]);
    } catch (error) {
      console.error("Error fetching response from Gemini AI:", error);
      setMessages([
        ...updatedMessages,
        {
          text: "My neural transmission is experiencing brief interference. Please verify your connection and try again.",
          sender: "bot",
          time: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Local AI fallback response
  const getLocalResponse = (message) => {
    const query = message.toLowerCase();

    if (query.includes("cramp") || query.includes("pain")) {
      return `Based on your logging of ${todayLogs.painList?.join(", ") || "cramps"} and your current predicted cycle phase, I recommend targeting pain-relief through a combination of thermal and physical techniques:\n1. **Heat Therapy:** Apply a warm compress (40°C) to the lower abdominal wall to stimulate microcirculation.\n2. **Magnesium & Zinc:** High dietary magnesium relaxes smooth uterine muscle fibers.\n3. **Restorative Yoga:** Engage in child's pose (Balasana) or legs-up-the-wall pose to decompress pressure on lumbar pathways. \nLet me know if you would like me to explain any of these further!`;
    }

    if (
      query.includes("recipe") ||
      query.includes("nutrition") ||
      query.includes("eat") ||
      query.includes("food")
    ) {
      return `For your current **${currentPhase}**, let's optimize your nourishment:\n- **During Menstruation/Luteal:** Prioritize iron-rich foods (spinach, lentils) and warming stews. Progesterone requires healthy fats (avocado, seeds).\n- **During Follicular/Ovulatory:** Lean proteins, antioxidant berries, and fermented foods (kimchi, kefir) will balance the rapid estrogen peak and aid follicle development.\nWould you like a sample meal plan for breakfast, lunch, or dinner?`;
    }

    if (
      query.includes("sleep") ||
      query.includes("insomnia") ||
      query.includes("night")
    ) {
      return `Sleep disruptions during the Luteal/Menstrual phases are often linked to basal temperature shifts and low melatonin. Try this:\n- **Magnesium Bisglycinate:** Helps relax neural pathways before bed.\n- **Cycle-Syncing Temperature:** Keep your room cool (18°C) to aid natural core temperature drops.\n- **Breathing Cycles:** The 4-7-8 breathing technique down-regulates cortisol spikes.`;
    }

    if (query.includes("hydration") || query.includes("water")) {
      return `Hydration is highly critical during the ${currentPhase}. Optimal water levels facilitate the fluid transfer needed for uterine lining shedding, reduce bloating caused by sodium retention, and alleviate fatigue. Try to hit your daily goal of 2000 mL today!`;
    }

    return `I received your inquiry: "${message}". \n\nI am currently running in prototype companion mode. Here is a summary of your synced health data:\n- **Current Cycle Phase:** ${currentPhase} (Estimated Day of Cycle)\n- **Active Symptom Logs:** ${todayLogs.painList?.length > 0 ? todayLogs.painList.join(", ") : "None logged today"}\n- **Water Consumption:** ${todayLogs.water || 0} mL\n\nPlease ask me about nutrition tips, workout modifications, or symptom remedies custom-tailored to these cycle coordinates!`;
  };

  const callGeminiAPI = async (userMessage) => {
    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getLocalResponse(userMessage));
        }, 1200);
      });
    }

    try {
      const contextualQuery = `User cycle day: estimated phase ${currentPhase}, logged symptoms today: ${todayLogs.painList?.join(", ") || "none"}. User says: ${userMessage}`;

      const response = await axios.post(
        GEMINI_API_URL,
        {
          message: contextualQuery,
          context:
            "menstrual wellness tips, nutrition, period comfort, scientific cycle explanations, empathetic supportive tone"
        },
        {
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      return (
        response.data?.response ||
        response.data?.message ||
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Error fetching Gemini AI response:", error);
      throw error;
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