import React, { useState } from 'react';
import './ChatInput.css';

function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      if (onSendMessage(message)) {
        setMessage('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        placeholder={disabled ? 'Connecting...' : 'Type a message...'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        maxLength={500}
      />
      <button 
        type="submit" 
        className="chat-send-button"
        disabled={disabled || !message.trim()}
      >
        Send
      </button>
    </form>
  );
}

export default ChatInput;