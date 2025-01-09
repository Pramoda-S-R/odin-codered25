import React from "react";
import WebSocketConnection from "../../components/WebSocketConnection";
import AudioVideoComponent from "../../components/AudioVideoComponent";
import LiveStreamComponent from "../../components/LiveStreamComponent";
import FrameCapture from "../../components/FrameCapture";
import AudioCapture from "../../components/AudioCapture";
import IdkBruh from "../../components/IdkBruh";
import GeminiLiveDemo from "../../components/AnotherDance";

const Home = () => {
  return (
    <div className="flex flex-1">
      Home
      <div className="app container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Conversational Bot</h1>
        <GeminiLiveDemo />
      </div>
    </div>
  );
};

export default Home;
