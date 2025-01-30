import React, { useState } from "react";
import "./TalkHere.css";

const TalkHere = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const sendMessage = () => {
    if (inputValue.trim() !== "") {
      // Add user message
      const newMessages = [...messages, { text: inputValue, sender: "user" }];
      setMessages(newMessages);

      // Simulate FlowBot's response
      setTimeout(() => {
        const botResponse = generateBotResponse(inputValue);
        setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
      }, 1000);

      setInputValue(""); // Clear the input field
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const generateBotResponse = (userMessage) => {
    // Example logic for FlowBot responses
    if (userMessage.toLowerCase().includes("hi")) {
      return "Hi there! I'm FlowBot, your health companion. How can ehfjefjfgjhhI assist you today?";
    }
    return "Thank you for your message! Let me know how I can help.";
  };

  return (
    <div className="chat-container">
      <h1 className="chat-heading">Talk to FlowBot</h1>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="chat-input"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default TalkHere;
