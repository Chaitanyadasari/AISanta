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
  const { nameCode } = req.body;
  if (!nameCode || nameCode.toLowerCase() === 'admin') {
    return res.status(400).json({ success: false, message: 'Invalid NameCode!' });
  }
  const players = getPlayers();
  if (players.some(p => p.nameCode.toLowerCase() === nameCode.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'NameCode already exists' });
  }
  players.push({ nameCode, email: null, isAdmin: false });
  writePlayers(players);
  res.json({ success: true, message: 'NameCode added' });
};
