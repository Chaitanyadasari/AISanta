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

app.post('/api/login', authController.login);
app.post('/api/getAssignment', gameController.getAssignment);
app.get('/api/namecodes', playerController.getNameCodes);
app.post('/api/namecodes', playerController.addNameCode);
app.post('/api/generate-assignments', gameController.generateAssignments);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
