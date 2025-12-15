# 🎅 AISanta Group Chat Feature - Architecture Design Document

## 📋 Executive Summary

This document outlines the architectural design for adding a real-time group chat feature to the AISanta Secret Santa application. The chat will be accessible to all authenticated users, enabling participants to communicate about gift ideas, coordinate logistics, and build excitement around the gift exchange.

---

## 🎯 Requirements

### Functional Requirements
1. **Real-time Messaging**: Users can send and receive messages instantly
2. **Global Chat Room**: Single shared chat room for all authenticated users
3. **Message Persistence**: Chat history is stored and retrieved on login
4. **User Identification**: Each message displays the sender's name/username
5. **Auto-enrollment**: All registered users automatically have access to chat
6. **Authentication Required**: Only logged-in users can access chat
7. **Message Timestamps**: Each message shows when it was sent
8. **Message History**: Users can see previous messages when they join

### Non-Functional Requirements
1. **Real-time Performance**: Messages delivered within 1 second
2. **Scalability**: Support for concurrent users (50-100 typical Secret Santa groups)
3. **Reliability**: No message loss during transmission
4. **Accessibility**: Chat works on desktop and mobile devices
5. **Security**: Messages only visible to authenticated users

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Chat Component                                     │    │
│  │  - Message List (Auto-scroll)                       │    │
│  │  - Message Input                                    │    │
│  │  - WebSocket Connection Handler                     │    │
│  │  - User Presence Indicator                          │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↕ WebSocket                          │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js/Express)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  WebSocket Server (Socket.io)                       │    │
│  │  - Connection Management                            │    │
│  │  - Message Broadcasting                             │    │
│  │  - Authentication Middleware                        │    │
│  │  - Event Handlers                                   │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Chat Controller (REST API)                         │    │
│  │  - GET /api/chat/messages (History)                 │    │
│  │  - POST /api/chat/message (Fallback)                │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Data Layer                                         │    │
│  │  - messages.json (Message Storage)                  │    │
│  │  - File-based persistence                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Backend
- **Socket.io** (v4.7+): WebSocket library for real-time bidirectional communication
- **Express** (existing): HTTP server for REST API endpoints
- **Node.js** (existing): Runtime environment

### Frontend
- **socket.io-client** (v4.7+): Client library for Socket.io
- **React** (existing): UI framework
- **React Hooks**: useState, useEffect, useRef for state management

### Data Storage
- **JSON files**: Consistent with existing data storage pattern
- **File structure**: `server/models/messages.json`

---

## 📊 Data Models

### Message Schema

```json
{
  "id": "msg_1234567890",
  "userId": "user123",
  "username": "JohnDoe",
  "nameCode": "SANTA2024",
  "message": "Looking forward to the gift exchange!",
  "timestamp": "2024-12-14T21:15:30.000Z",
  "type": "user_message"
}
```

### System Message Schema

```json
{
  "id": "msg_1234567891",
  "type": "system",
  "message": "JohnDoe joined the chat",
  "timestamp": "2024-12-14T21:15:00.000Z"
}
```

### Messages File Structure (server/models/messages.json)

```json
{
  "messages": [
    {
      "id": "msg_1702591530000",
      "userId": "admin",
      "username": "Admin",
      "nameCode": "admin",
      "message": "Welcome to the AISanta group chat!",
      "timestamp": "2024-12-14T20:00:00.000Z",
      "type": "user_message"
    }
  ]
}
```

---

## 🔌 API Design

### WebSocket Events

#### Client → Server Events

1. **`join_chat`**
   ```javascript
   {
     userId: "user123",
     username: "JohnDoe",
     nameCode: "SANTA2024"
   }
   ```

2. **`send_message`**
   ```javascript
   {
     userId: "user123",
     username: "JohnDoe",
     nameCode: "SANTA2024",
     message: "Hello everyone!"
   }
   ```

3. **`disconnect`** (automatic)

#### Server → Client Events

1. **`message_history`** (on connection)
   ```javascript
   {
     messages: [/* array of message objects */]
   }
   ```

2. **`new_message`** (broadcast)
   ```javascript
   {
     id: "msg_1234567890",
     userId: "user123",
     username: "JohnDoe",
     nameCode: "SANTA2024",
     message: "Hello everyone!",
     timestamp: "2024-12-14T21:15:30.000Z",
     type: "user_message"
   }
   ```

3. **`user_joined`** (broadcast)
   ```javascript
   {
     username: "JohnDoe",
     timestamp: "2024-12-14T21:15:00.000Z"
   }
   ```

4. **`user_left`** (broadcast)
   ```javascript
   {
     username: "JohnDoe",
     timestamp: "2024-12-14T21:16:00.000Z"
   }
   ```

5. **`error`**
   ```javascript
   {
     message: "Error description"
   }
   ```

### REST API Endpoints (Fallback)

#### GET `/api/chat/messages`
**Purpose**: Retrieve chat history (fallback if WebSocket fails)

**Response**:
```json
{
  "success": true,
  "messages": [/* array of message objects */]
}
```

#### POST `/api/chat/message`
**Purpose**: Send message via REST (fallback if WebSocket fails)

**Request**:
```json
{
  "userId": "user123",
  "username": "JohnDoe",
  "nameCode": "SANTA2024",
  "message": "Hello everyone!"
}
```

**Response**:
```json
{
  "success": true,
  "message": {/* message object */}
}
```

---

## 🗂️ File Structure

### New Files to Create

```
AISanta/
├── server/
│   ├── controllers/
│   │   └── chatController.js           # Chat business logic
│   ├── models/
│   │   └── messages.json               # Message storage
│   ├── socketHandlers.js               # Socket.io event handlers
│   └── app.js                          # Updated with Socket.io
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── Chat.js                 # Main chat component
│       │   ├── ChatMessage.js          # Individual message component
│       │   └── ChatInput.js            # Message input component
│       ├── hooks/
│       │   └── useChat.js              # Custom hook for chat logic
│       └── utils/
│           └── socket.js               # Socket.io client setup
│
└── package.json                        # Updated with socket.io
```

### Modified Files

```
├── server/app.js                       # Add Socket.io server
├── client/src/App.js                   # Add Chat route/component
├── client/src/components/Navigation.js # Add Chat navigation link
├── package.json (root)                 # Add socket.io dependency
└── client/package.json                 # Add socket.io-client dependency
```

---

## 💻 Implementation Details

### Backend Implementation

#### 1. Socket.io Server Setup (server/app.js)

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const socketHandlers = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
socketHandlers(io);

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 2. Socket Event Handlers (server/socketHandlers.js)

```javascript
const chatController = require('./controllers/chatController');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send message history on connection
    socket.on('join_chat', async (userData) => {
      try {
        socket.userData = userData;
        const history = await chatController.getMessageHistory();
        socket.emit('message_history', { messages: history });
        
        // Broadcast user joined
        socket.broadcast.emit('user_joined', {
          username: userData.username,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const message = await chatController.saveMessage(data);
        io.emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userData) {
        socket.broadcast.emit('user_left', {
          username: socket.userData.username,
          timestamp: new Date().toISOString()
        });
      }
      console.log('User disconnected:', socket.id);
    });
  });
};
```

#### 3. Chat Controller (server/controllers/chatController.js)

```javascript
const fs = require('fs').promises;
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, '../models/messages.json');
const MAX_MESSAGES = 500; // Keep last 500 messages

// Initialize messages file if it doesn't exist
async function initMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2));
  }
}

async function getMessageHistory() {
  await initMessagesFile();
  const data = await fs.readFile(MESSAGES_FILE, 'utf8');
  const { messages } = JSON.parse(data);
  return messages.slice(-100); // Return last 100 messages
}

async function saveMessage(messageData) {
  await initMessagesFile();
  
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: messageData.userId,
    username: messageData.username,
    nameCode: messageData.nameCode,
    message: messageData.message.trim(),
    timestamp: new Date().toISOString(),
    type: 'user_message'
  };

  const data = await fs.readFile(MESSAGES_FILE, 'utf8');
  const json = JSON.parse(data);
  
  json.messages.push(message);
  
  // Keep only last MAX_MESSAGES
  if (json.messages.length > MAX_MESSAGES) {
    json.messages = json.messages.slice(-MAX_MESSAGES);
  }
  
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(json, null, 2));
  
  return message;
}

// REST API fallback endpoints
async function getMessages(req, res) {
  try {
    const messages = await getMessageHistory();
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
}

async function postMessage(req, res) {
  try {
    const message = await saveMessage(req.body);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save message' });
  }
}

module.exports = {
  getMessageHistory,
  saveMessage,
  getMessages,
  postMessage
};
```

### Frontend Implementation

#### 1. Socket.io Client Setup (client/src/utils/socket.js)

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 
  (process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000');

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

#### 2. Custom Chat Hook (client/src/hooks/useChat.js)

```javascript
import { useState, useEffect, useRef } from 'react';
import { initSocket, getSocket } from '../utils/socket';

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket
    socketRef.current = initSocket();
    const socket = socketRef.current;

    // Connect socket
    socket.connect();

    // Connection events
    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      socket.emit('join_chat', {
        userId: user.userId,
        username: user.username,
        nameCode: user.nameCode
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError('Connection failed. Retrying...');
      console.error('Socket connection error:', err);
    });

    // Message events
    socket.on('message_history', (data) => {
      setMessages(data.messages);
    });

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [...prev, {
        id: `system_${Date.now()}`,
        type: 'system',
        message: `${data.username} joined the chat`,
        timestamp: data.timestamp
      }]);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [...prev, {
        id: `system_${Date.now()}`,
        type: 'system',
        message: `${data.username} left the chat`,
        timestamp: data.timestamp
      }]);
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message_history');
      socket.off('new_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('error');
      socket.disconnect();
    };
  }, [user]);

  const sendMessage = (messageText) => {
    const socket = getSocket();
    if (socket && connected && messageText.trim()) {
      socket.emit('send_message', {
        userId: user.userId,
        username: user.username,
        nameCode: user.nameCode,
        message: messageText.trim()
      });
      return true;
    }
    return false;
  };

  return { messages, connected, error, sendMessage };
};
```

#### 3. Chat Component (client/src/components/Chat.js)

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './Chat.css';

function Chat({ user }) {
  const { messages, connected, error, sendMessage } = useChat(user);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (messageText) => {
    if (sendMessage(messageText)) {
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
          <span>{connected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {error && (
        <div className="chat-error">
          ⚠️ {error}
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isOwnMessage={msg.userId === user.userId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={!connected}
      />
    </div>
  );
}

export default Chat;
```

#### 4. Message Component (client/src/components/ChatMessage.js)

```javascript
import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message, isOwnMessage }) {
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
    <div className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
      <div className="message-content">
        {!isOwnMessage && (
          <div className="message-username">{message.username}</div>
        )}
        <div className="message-text">{message.message}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}

export default ChatMessage;
```

#### 5. Input Component (client/src/components/ChatInput.js)

```javascript
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

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        placeholder={disabled ? 'Connecting...' : 'Type a message...'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
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
```

---

## 🎨 UI/UX Design

### Chat Interface Layout

```
┌──────────────────────────────────────────────────────────┐
│  🎅 Group Chat                      ● Connected          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  System: JohnDoe joined the chat      10:15 AM  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  JohnDoe:                                        │   │
│  │  Looking forward to the gift exchange!          │   │
│  │                                     10:16 AM     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  You:                                            │   │
│  │  Me too! Can't wait!                             │   │
│  │                                     10:17 AM     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  [Type a message...]                          [Send]     │
└──────────────────────────────────────────────────────────┘
```

### Color Scheme (Consistent with existing)
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Own Messages**: Light blue background `#e3f2fd`
- **Other Messages**: White background `#ffffff`
- **System Messages**: Gray italic text
- **Send Button**: Gradient matching theme

### Responsive Design
- **Desktop**: Full-width sidebar or modal (600px wide)
- **Tablet**: Slide-in panel (500px wide)
- **Mobile**: Full-screen overlay

---

## 🔒 Security Considerations

### Authentication
- **Session Validation**: Verify user session before allowing chat access
- **Socket Authentication**: Validate user credentials on socket connection
- **Token-based**: Consider JWT tokens for socket authentication (future enhancement)

### Input Sanitization
- **XSS Prevention**: Sanitize all message content before storing/displaying
- **Message Length**: Limit messages to 500 characters
- **Rate Limiting**: Prevent spam (max 10 messages per minute per user)

### Data Protection
- **No Sensitive Data**: Remind users not to share personal information
- **Message Retention**: Implement message expiration (optional: delete after 30 days)
- **Admin Controls**: Allow admin to moderate/delete inappropriate messages (future enhancement)

---

## 📈 Scalability Considerations

### Current Scope (Phase 1)
- **In-memory socket management**: Suitable for single-server deployment
- **File-based storage**: Adequate for small groups (< 100 users)
- **No clustering**: Single Node.js instance

### Future Enhancements (Phase 2)
- **Redis adapter**: For multi-server Socket.io synchronization
- **Database migration**: Move to MongoDB/PostgreSQL for better performance
- **Message pagination**: Load messages in chunks
- **User typing indicators**: Show when users are typing
- **Read receipts**: Track message read status
- **Private messages**: One-on-one conversations
- **File sharing**: Share images and files
- **Message reactions**: Emoji reactions to messages
- **Message search**: Search through chat history
- **Admin moderation**: Message deletion and user management

---

## 🧪 Testing Strategy

### Unit Tests
- Message sanitization functions
- Message storage/retrieval logic
- Date formatting utilities

### Integration Tests
- Socket connection establishment
- Message broadcasting
- Error handling
- Disconnection recovery

### End-to-End Tests
- User login → join chat → send message
- Multiple users sending messages simultaneously
- Connection loss and reconnection
- Message history loading

### Performance Tests
- 50 concurrent users sending messages
- Message broadcast latency
- Memory usage monitoring
- File I/O performance

---

## 📦 Dependencies

### New Dependencies

**Backend (package.json)**
```json
{
  "socket.io": "^4.7.2"
}
```

**Frontend (client/package.json)**
```json
{
  "socket.io-client": "^4.7.2"
}
```

---

## 🚀 Implementation Phases

### Phase 1: Core Chat (Week 1)
1. ✅ Install Socket.io dependencies
2. ✅ Set up Socket.io server
3. ✅ Create message storage (messages.json)
4. ✅ Implement socket event handlers
5. ✅ Create chat controller
6. ✅ Build frontend components
7. ✅ Implement real-time messaging
8. ✅ Add to navigation

### Phase 2: Polish & Testing (Week 2)
1. ✅ Add CSS styling
2. ✅ Implement auto-scroll
3. ✅ Add connection status indicator
4. ✅ Error handling and user feedback
5. ✅ Cross-browser testing
6. ✅ Mobile responsiveness
7. ✅ Documentation

### Phase 3: Enhancements (Optional)
1. ⏳ Typing indicators
2. ⏳ Message reactions
3. ⏳ User online status
4. ⏳ Message search
5. ⏳ Admin moderation tools

---

## 📝 Integration Points

### Existing Code Modifications

#### 1. server/app.js
- Replace `app.listen()` with `server.listen()`
- Add Socket.io initialization
- Import socket handlers

#### 2. client/src/App.js
- Add Chat component state management
- Add chat route/conditional rendering
- Pass user data to Chat component

#### 3. client/src/components/Navigation.js
- Add "Chat" navigation link
- Update active state handling

#### 4. package.json files
- Add socket.io dependencies
- Update scripts if needed

---

## 🎯 Success Metrics

### Technical Metrics
- **Message Delivery Time**: < 1 second
- **Connection Success Rate**: > 99%
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

### User Metrics
- **Daily Active Chat Users**: Track engagement
- **Messages per Day**: Monitor activity
- **Average Session Duration**: User engagement indicator

### Business Metrics
- **User Satisfaction**: Positive feedback
- **Feature Adoption**: % of users using chat
- **Impact on Gift Exchange**: Better coordination

---

## 🔄 Migration Strategy

### Deployment Steps
1. **Backup**: Backup existing code and data
2. **Install Dependencies**: Run `npm install` in root and client
3. **Create Files**: Add new server and client files
4. **Modify Files**: Update existing files with chat integration
5. **Test Locally**: Verify chat works in development
6. **Deploy**: Push to production
7. **Monitor**: Watch logs for issues
8. **Rollback Plan**: Keep previous version for quick rollback

### Rollback Procedure
If issues arise:
1. Remove chat navigation link (hides feature)
2. Revert server/app.js changes
3. Remove socket.io dependencies
4. Restart server

---

## 📚 Documentation Requirements

### User Documentation
- How to access chat
- Chat etiquette guidelines
- Troubleshooting common issues

### Developer Documentation
- Socket event reference
- API endpoint documentation
- Code comments and JSDoc
- Architecture diagrams (this document)

### Operations Documentation
- Deployment procedures
- Monitoring and alerts
- Backup and recovery
- Performance tuning

---

## 🎉 Conclusion

This architecture provides a scalable, maintainable foundation for adding real-time group chat to the AISanta application. The design leverages industry-standard technologies (Socket.io), follows React best practices, and maintains consistency with the existing codebase structure.

The phased implementation approach allows for iterative development, testing, and deployment while minimizing risk to the existing application functionality.

---

## 📞 Questions & Support

For questions about this architecture or implementation:
1. Review this document thoroughly
2. Check Socket.io documentation: https://socket.io/docs/v4/
3. Refer to existing codebase patterns
4. Test locally before deploying

**Happy Coding! 🎅🎄**