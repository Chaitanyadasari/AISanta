const chatController = require('./controllers/chatController');

// Rate limiting: track message timestamps per user
const userMessageTimestamps = new Map();
const MAX_MESSAGES_PER_MINUTE = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userTimestamps = userMessageTimestamps.get(userId) || [];
  
  // Filter out timestamps older than 1 minute
  const recentTimestamps = userTimestamps.filter(ts => now - ts < 60000);
  
  if (recentTimestamps.length >= MAX_MESSAGES_PER_MINUTE) {
    return false;
  }
  
  recentTimestamps.push(now);
  userMessageTimestamps.set(userId, recentTimestamps);
  return true;
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send message history on connection
    socket.on('join_chat', async (userData) => {
      try {
        if (!userData || !userData.userId || !userData.username) {
          socket.emit('error', { message: 'Invalid user data' });
          return;
        }

        socket.userData = userData;
        const history = await chatController.getMessageHistory();
        socket.emit('message_history', { messages: history });
        
        console.log(`${userData.username} joined chat`);
        
        // Broadcast user joined (to others only)
        socket.broadcast.emit('user_joined', {
          username: userData.username,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        if (!socket.userData) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!data || !data.message || typeof data.message !== 'string') {
          socket.emit('error', { message: 'Invalid message format' });
          return;
        }

        // Rate limiting
        if (!checkRateLimit(socket.userData.userId)) {
          socket.emit('error', { message: 'Too many messages. Please wait a moment.' });
          return;
        }

        // Use socket's stored userData to ensure authenticity
        const messageData = {
          userId: socket.userData.userId,
          username: socket.userData.username,
          nameCode: socket.userData.nameCode,
          message: data.message
        };

        const message = await chatController.saveMessage(messageData);
        
        // Broadcast to all clients including sender
        io.emit('new_message', message);
        
        console.log(`Message from ${socket.userData.username}: ${data.message.substring(0, 50)}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: error.message || 'Failed to send message' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userData) {
        console.log(`${socket.userData.username} disconnected`);
        socket.broadcast.emit('user_left', {
          username: socket.userData.username,
          timestamp: new Date().toISOString()
        });
      }
      console.log('User disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};