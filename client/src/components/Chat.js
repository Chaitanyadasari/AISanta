import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './Chat.css';

function Chat({ user }) {
  const { messages, connected, error, sendMessage } = useChat(user);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  // Auto-scroll to bottom on new messages (unless user has scrolled up)
  useEffect(() => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolled]);

  // Detect if user has scrolled up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setUserScrolled(!isAtBottom);
    }
  };

  const handleSendMessage = (messageText) => {
    if (sendMessage(messageText)) {
      // Reset scroll when user sends a message
      setUserScrolled(false);
      return true;
    }
    return false;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🎅 Group Chat</h2>
        <div className="chat-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{connected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {error && (
        <div className="chat-error">
          ⚠️ {error}
        </div>
      )}

      <div 
        className="chat-messages" 
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isOwnMessage={msg.userId === user.username}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {!userScrolled && messages.length > 0 && (
        <div className="scroll-indicator" style={{ display: 'none' }}>
          <button onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setUserScrolled(false);
          }}>
            ↓ New messages
          </button>
        </div>
      )}

      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={!connected}
      />
    </div>
  );
}

export default Chat;