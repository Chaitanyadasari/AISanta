import { useState, useEffect, useRef } from 'react';
import { initSocket, getSocket } from '../utils/socket';

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !user.username) return;

    // Initialize socket
    socketRef.current = initSocket();
    const socket = socketRef.current;

    // Connect socket
    socket.connect();

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      setError(null);
      socket.emit('join_chat', {
        userId: user.username,
        username: user.username,
        nameCode: user.nameCode || user.username
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Connection failed. Retrying...');
    });

    // Message events
    socket.on('message_history', (data) => {
      console.log('Received message history:', data.messages.length);
      setMessages(data.messages);
    });

    socket.on('new_message', (message) => {
      console.log('New message:', message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [...prev, {
        id: `system_${Date.now()}_${Math.random()}`,
        type: 'system',
        message: `${data.username} joined the chat`,
        timestamp: data.timestamp
      }]);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [...prev, {
        id: `system_${Date.now()}_${Math.random()}`,
        type: 'system',
        message: `${data.username} left the chat`,
        timestamp: data.timestamp
      }]);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
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
        userId: user.username,
        username: user.username,
        nameCode: user.nameCode || user.username,
        message: messageText.trim()
      });
      return true;
    }
    return false;
  };

  return { messages, connected, error, sendMessage };
};