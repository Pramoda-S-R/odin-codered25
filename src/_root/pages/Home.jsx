import React from "react";
import WebSocketChat from "../../websocket/WebSocketChat";

const Home = () => {
  return (
    <div className="flex flex-1 text-7xl">
      Home
      <WebSocketChat />
    </div>
  );
};

export default Home;
