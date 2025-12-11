const fs = require('fs');
const path = require('path');

const PLAYERS_FILE = path.join(__dirname, '../models/players.json');

function getPlayers() {
  return JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf-8')).players;
}
function writePlayers(players) {
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
}

exports.getNameCodes = (req, res) => {
  const players = getPlayers();
  const nameCodes = players.filter(p => !p.isAdmin).map(p => p.nameCode);
  res.json({ nameCodes });
};

exports.addNameCode = (req, res) => {
  const { nameCode, email } = req.body;
  // Check nameCode, prevent duplicates and admin
  if (!nameCode || nameCode.toLowerCase() === 'admin') {
    return res.status(400).json({ success: false, message: 'Invalid NameCode!' });
  }
  // Validate email
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required!' });
  }
  const players = getPlayers();
  if (players.some(p => p.nameCode.toLowerCase() === nameCode.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'NameCode already exists' });
  }
  players.push({ nameCode, email, isAdmin: false });
  writePlayers(players);
  res.json({ success: true, message: 'NameCode and email added' });
};

exports.deleteNameCode = (req, res) => {
  const { nameCode } = req.body;
  if (!nameCode) {
    return res.status(400).json({ success: false, message: 'NameCode is required' });
  }
  
  // Prevent deletion of admin
  if (nameCode.toLowerCase() === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
  }
  
  const players = getPlayers();
  const playerIndex = players.findIndex(p => p.nameCode.toLowerCase() === nameCode.toLowerCase() && !p.isAdmin);
  
  if (playerIndex === -1) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }
  
  players.splice(playerIndex, 1);
  writePlayers(players);
  res.json({ success: true, message: 'Player deleted successfully' });
};
