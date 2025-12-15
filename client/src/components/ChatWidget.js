import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatWidget.css';

function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { messages, connected, error, sendMessage } = useChat(isOpen ? user : null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const lastMessageCountRef = useRef(0);

  // Track unread messages when widget is closed
  useEffect(() => {
    if (!isOpen && messages.length > lastMessageCountRef.current) {
      const newMessages = messages.length - lastMessageCountRef.current;
      setUnreadCount(prev => prev + newMessages);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isOpen]);

  // Reset unread count when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolled, isOpen]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setUserScrolled(!isAtBottom);
    }
  };

  const handleSendMessage = (messageText) => {
    if (sendMessage(messageText)) {
      setUserScrolled(false);
      return true;
    }
    return false;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button className="chat-widget-button" onClick={toggleChat}>
          💬
          {unreadCount > 0 && (
            <span className="chat-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat Widget Window */}
      {isOpen && (
        <div className="chat-widget-container">
          <div className="chat-widget-header">
            <div className="chat-widget-title">
              <span>🎅 Group Chat</span>
              <div className="chat-widget-status">
                <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
                <span className="status-text">{connected ? 'Connected' : 'Connecting...'}</span>
              </div>
            </div>
            <button 
              className="chat-widget-close" 
              onClick={toggleChat}
              title="Close"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="chat-widget-error">
              ⚠️ {error}
            </div>
          )}

          <div 
            className="chat-widget-messages" 
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 ? (
              <div className="chat-widget-empty">
                <p>No messages yet.<br/>Start the conversation! 🎄</p>
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

          <div className="chat-widget-input">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={!connected}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;