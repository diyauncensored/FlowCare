import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./TalkHere.css";

const TalkHere = ({ loggedSymptoms, lastPeriod, cycleLength, periodLength }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am FlowBot, your AI wellness companion. I can help analyze your symptoms, suggest phase-appropriate nutrition, and offer exercise guides. How are you feeling today?",
      sender: "bot"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Gemini API configuration
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || null;
  const GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL || null;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    today.setHours(0,0,0,0);
    lastDate.setHours(0,0,0,0);
    const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength;
    
    if (cycleDay < periodLength) return "Menstruation";
    if (cycleDay <= 11) return "Follicular Phase";
    if (cycleDay <= 16) return "Ovulatory Phase";
    return "Luteal Phase";
  };

  const currentPhase = getCurrentPhase();

  // Create customized smart chips
  const getSmartChips = () => {
    const chips = [];
    
    // Add cramp relief advice if user logged cramps
    if (todayLogs.painList?.includes("Cramps")) {
      chips.push("💆 How can I relieve cramps today?");
    }
    
    // Add hydration advice if logged water is low
    if (todayLogs.water && todayLogs.water < 1000) {
      chips.push("💧 Why is hydration critical right now?");
    }

    // Default choices
    chips.push(`🥗 Recipe ideas for my ${currentPhase}`);
    chips.push("😴 Tips to sleep better during my cycle");
    chips.push("🧘 Gentle exercises for menstrual fatigue");

    // Deduplicate and slice to top 3
    return [...new Set(chips)].slice(0, 3);
  };

  const smartChips = getSmartChips();

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage(inputValue);
    }
  };

  const handleChipClick = (chipText) => {
    // Strip leading emoji
    const query = chipText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "").trim();
    sendMessage(query);
  };

  const sendMessage = async (textToSend) => {
    if (!textToSend || textToSend.trim() === "") return;

    // Add user message
    const updatedMessages = [...messages, { text: textToSend, sender: "user" }];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponse = await getGeminiResponse(textToSend);
      setMessages([...updatedMessages, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Error fetching response from Gemini AI:", error);
      setMessages([
        ...updatedMessages,
        { text: "My neural transmission is experiencing brief interference. Please verify your connection and try again.", sender: "bot" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Holographic Local AI fallback response - extremely detailed and professional!
  const generateLocalResponse = (message) => {
    const query = message.toLowerCase();
    
    // Cramps query
    if (query.includes("cramp") || query.includes("pain")) {
      return `Based on your logging of ${todayLogs.painList?.join(", ") || "cramps"} and your current predicted cycle phase, I recommend targeting pain-relief through a combination of thermal and physical techniques:
1. **Heat Therapy:** Apply a warm compress (40°C) to the lower abdominal wall to stimulate microcirculation.
2. **Magnesium & Zinc:** High dietary magnesium relaxes smooth uterine muscle fibers.
3. **Restorative Yoga:** Engage in child's pose (Balasana) or legs-up-the-wall pose to decompress pressure on lumbar pathways. 
Let me know if you would like me to explain any of these further!`;
    }

    // Recipe query
    if (query.includes("recipe") || query.includes("nutrition") || query.includes("eat") || query.includes("food")) {
      return `For your current **${currentPhase}**, let's optimize your nourishment:
- **During Menstruation/Luteal:** Prioritize iron-rich foods (spinach, lentils) and warming stews. Progesterone requires healthy fats (avocado, seeds).
- **During Follicular/Ovulatory:** Lean proteins, antioxidant berries, and fermented foods (kimchi, kefir) will balance the rapid estrogen peak and aid follicle development.
Would you like a sample meal plan for breakfast, lunch, or dinner?`;
    }

    // Sleep queries
    if (query.includes("sleep") || query.includes("insomnia") || query.includes("night")) {
      return `Sleep disruptions during the Luteal/Menstrual phases are often linked to basal temperature shifts and low melatonin. Try this:
- **Magnesium Bisglycinate:** Helps relax neural pathways before bed.
- **Cycle-Syncing Temperature:** Keep your room cool (18°C) to aid natural core temperature drops.
- **Breathing Cycles:** The 4-7-8 breathing technique down-regulates cortisol spikes.`;
    }

    // Hydration queries
    if (query.includes("hydration") || query.includes("water")) {
      return `Hydration is highly critical during the ${currentPhase}. Optimal water levels facilitate the fluid transfer needed for uterine lining shedding, reduce bloating caused by sodium retention, and alleviate fatigue. Try to hit your daily goal of 2000 mL today!`;
    }

    // Default contextual welcome
    return `I received your inquiry: "${message}". 

I am currently running in prototype companion mode. Here is a summary of your synced health data:
- **Current Cycle Phase:** ${currentPhase} (Estimated Day of Cycle)
- **Active Symptom Logs:** ${todayLogs.painList?.length > 0 ? todayLogs.painList.join(", ") : "None logged today"}
- **Water Consumption:** ${todayLogs.water || 0} mL

Please ask me about nutrition tips, workout modifications, or symptom remedies custom-tailored to these cycle coordinates!`;
  };

  const getGeminiResponse = async (userMessage) => {
    // If API URL or key not provided, return a highly intelligent local contextual response
    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateLocalResponse(userMessage));
        }, 1200); // realistic typing delay
      });
    }

    try {
      // Append full symptom & cycle context for a premium smart assistant response
      const contextualQuery = `User cycle day: estimated phase ${currentPhase}, logged symptoms today: ${todayLogs.painList?.join(", ") || "none"}. User says: ${userMessage}`;
      
      const response = await axios.post(
        GEMINI_API_URL,
        {
          message: contextualQuery,
          context: "menstrual wellness tips, nutrition, period comfort, scientific cycle explanations, empathetic supportive tone",
        },
        {
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.response || response.data?.message || JSON.stringify(response.data);
    } catch (error) {
      console.error("Error fetching Gemini AI response:", error);
      throw error;
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-glow-wrapper">
        <div className="chat-layout-card glass-card">
          
          {/* Hologram Header */}
          <div className="chat-header-panel">
            <div className="hologram-avatar-container">
              <div className="avatar-pulse-ring"></div>
              <div className="hologram-sphere">
                <svg className="avatar-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="var(--color-accent)"/>
                  <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" fill="var(--color-accent)"/>
                  <circle cx="6" cy="7" r="1.5" fill="white" opacity="0.4"/>
                  <circle cx="18" cy="7" r="1.5" fill="white" opacity="0.4"/>
                </svg>
              </div>
            </div>
            
            <div className="chat-header-text">
              <h2>FlowBot AI</h2>
              <p className="hologram-status-pulse">
                <span className="pulse-dot"></span>
                <span>Your Safe Space</span>
              </p>
            </div>
          </div>

          {/* Chat Bubble Window */}
          <div className="chat-bubbles-window">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`bubble-wrapper ${message.sender === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                <div className="bubble-body">
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            
            {/* Animated Typing Indicator */}
            {isTyping && (
              <div className="bubble-wrapper bot-bubble">
                <div className="bubble-body typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Choice Suggestion Chips */}
          <div className="chat-suggestion-chips">
            {smartChips.map((chipText, i) => (
              <button 
                key={i} 
                className="chat-chip-btn" 
                onClick={() => handleChipClick(chipText)}
              >
                {chipText}
              </button>
            ))}
          </div>

          {/* Text Input Row */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Ask about cramps, diet, sleep..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="chat-input-field"
            />
            <button onClick={() => sendMessage(inputValue)} className="btn-premium chat-send-btn">
              <span>Send</span>
              <span>⚡</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TalkHere;