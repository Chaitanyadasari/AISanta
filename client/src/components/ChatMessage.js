import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message, isOwnMessage }) {
  const isBotMessage = message.userId === 'santa-bot';
  
  if (message.type === 'system') {
    return (
      <div className="message-system">
        <span className="message-system-text">{message.message}</span>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${isOwnMessage ? 'message-own' : 'message-other'} ${isBotMessage ? 'message-bot' : ''}`}>
      <div className="message-content">
        {!isOwnMessage && (
          <div className="message-username">
            {isBotMessage && <span className="bot-badge">🤖 AI</span>}
            {message.username}
          </div>
        )}
        <div className="message-text">{message.message}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}

export default ChatMessage;