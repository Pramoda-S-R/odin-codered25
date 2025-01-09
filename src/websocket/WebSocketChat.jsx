import React, { useState } from "react";
import useWebSocket from "./useWebSocket";

const WebSocketChat = () => {
  const [input, setInput] = useState("");
  const { messages, isConnected, sendMessage } = useWebSocket(
    "ws://localhost:9082"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div>
      <h1>WebSocket Chat</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit" disabled={!isConnected}>
          Send
        </button>
      </form>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketChat;
