require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL || '*'
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load routers/controllers here (to be added)
const authController = require('./controllers/authController');
const gameController = require('./controllers/gameController');
const playerController = require('./controllers/playerController');
const chatController = require('./controllers/chatController');

// Initialize socket handlers
const socketHandlers = require('./socketHandlers');
socketHandlers(io);

// API routes
app.post('/api/signup', authController.signup);
app.post('/api/login', authController.login);
app.post('/api/getAssignment', gameController.getAssignment);
app.get('/api/namecodes', playerController.getNameCodes);
app.post('/api/namecodes', playerController.addNameCode);
app.delete('/api/namecodes', playerController.deleteNameCode);
app.post('/api/generate-assignments', gameController.generateAssignments);
app.post('/api/reset-assignments', gameController.resetAssignments);

// Chat API routes (REST fallback)
app.get('/api/chat/messages', chatController.getMessages);
app.post('/api/chat/message', chatController.postMessage);

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
 // Catch–all for non-API GETs -> send React index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Email configured: ${process.env.EMAIL_USER ? 'Yes (' + process.env.EMAIL_USER + ')' : 'No - Check .env file'}`);
  console.log(`Socket.io chat enabled`);
});
