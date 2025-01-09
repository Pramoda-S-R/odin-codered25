import React from "react";
import WebSocketConnection from "../../components/WebSocketConnection";
import AudioVideoComponent from "../../components/AudioVideoComponent";

const Home = () => {
  return (
    <div className="flex flex-1">
      Home
      <WebSocketConnection url="ws://localhost:9082" />
    </div>
  );
};

export default Home;
