import React, { useState, useEffect, useRef } from 'react';
import './SantaAI.css';
import api from '../utils/api';

const SantaAI = ({ isOpen, onClose, userName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message when opening
      setMessages([{
        id: 'welcome',
        content: `🎅 Ho ho ho! Welcome ${userName}! I'm Santa's AI Helper. I can help you with:\n\n• Gift suggestions - "suggest a gift for [name] who likes [hobby]"\n• Holiday messages - "create a message for [name]"\n• General advice - Just ask me anything!\n\nHow can I help you today?`,
        isBot: true,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, userName, messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('📤 Sending to Santa AI:', inputMessage);
      
      // Call the chatbot API directly (not through socket)
      const response = await fetch('/api/santa-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userName: userName
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      console.log('✅ Got response:', data);

      const botMessage = {
        id: `bot-${Date.now()}`,
        content: data.response,
        isBot: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: '🎅 Oops! I\'m having trouble right now. Please try again!',
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  if (!isOpen) return null;

  return (
    <div className="santa-ai-overlay" onClick={onClose}>
      <div className="santa-ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="santa-ai-header">
          <div className="santa-ai-title">
            <span className="santa-icon">🎅</span>
            <h2>Santa's AI Helper</h2>
          </div>
          <button className="santa-ai-close" onClick={onClose}>×</button>
        </div>

        <div className="santa-ai-quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction('suggest a gift for someone who likes ')}
          >
            🎁 Gift Ideas
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction('create a holiday message for ')}
          >
            ✉️ Holiday Message
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction('help')}
          >
            ❓ Help
          </button>
        </div>

        <div className="santa-ai-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`santa-ai-message ${msg.isBot ? 'bot' : 'user'}`}
            >
              {msg.isBot && <span className="message-icon">🎅</span>}
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              {!msg.isBot && <span className="message-icon">👤</span>}
            </div>
          ))}
          {isLoading && (
            <div className="santa-ai-message bot">
              <span className="message-icon">🎅</span>
              <div className="message-content loading">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="santa-ai-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Santa anything..."
            disabled={isLoading}
            className="santa-ai-input"
          />
          <button 
            type="submit" 
            disabled={!inputMessage.trim() || isLoading}
            className="santa-ai-send-btn"
          >
            {isLoading ? '...' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SantaAI;