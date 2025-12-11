require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load routers/controllers here (to be added)
const authController = require('./controllers/authController');
const gameController = require('./controllers/gameController');
const playerController = require('./controllers/playerController');

// API routes
app.post('/api/signup', authController.signup);
app.post('/api/login', authController.login);
app.post('/api/getAssignment', gameController.getAssignment);
app.get('/api/namecodes', playerController.getNameCodes);
app.post('/api/namecodes', playerController.addNameCode);
app.delete('/api/namecodes', playerController.deleteNameCode);
app.post('/api/generate-assignments', gameController.generateAssignments);
app.post('/api/reset-assignments', gameController.resetAssignments);

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
 // Catch–all for non-API GETs -> send React index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Email configured: ${process.env.EMAIL_USER ? 'Yes (' + process.env.EMAIL_USER + ')' : 'No - Check .env file'}`);
});
