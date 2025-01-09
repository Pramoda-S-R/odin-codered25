import React from 'react';

const ChatLog = ({ messages = [] }) => {
  return (
    <div id="chatLog">
      <h3>Chat Log</h3>
      {messages.length > 0 ? (
        messages.map((msg, index) => <p key={index}>{msg}</p>)
      ) : (
        <p>No messages yet.</p>
      )}
    </div>
  );
};

export default ChatLog;
