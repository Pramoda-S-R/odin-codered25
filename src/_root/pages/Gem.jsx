import React, { useState } from "react";
import AudioProcessor from "../../components/shared/AudioProcessor";
import VideoComponent from "../../components/shared/VideoComponent";
import ChatLog from "../../components/shared/ChatLog";

const App = () => {
  const [messages, setMessages] = useState([]);

  return (
    <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
      <header className="mdl-layout__header">
        <div className="mdl-layout__header-row">
          <span className="mdl-layout-title">Gemini Live Demo</span>
        </div>
      </header>
      <main className="mdl-layout__content">
        <div className="page-content">
          <div className="demo-content">
            <AudioProcessor onNewMessage={(msg) => setMessages((prev) => [...prev, msg])} />
            <VideoComponent />
            <ChatLog messages={messages} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
