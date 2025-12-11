const fs = require('fs');
const path = require('path');

const PLAYERS_FILE = path.join(__dirname, '../models/players.json');

function getPlayers() {
  const data = fs.readFileSync(PLAYERS_FILE, 'utf-8');
  return JSON.parse(data).players;
}

exports.login = (req, res) => {
  const { nameCode, email } = req.body;
  if (!nameCode || !email) {
    return res.status(400).json({ success: false, message: 'NameCode and Email are required.' });
  }
  const players = getPlayers();
  let user;
  if (nameCode.toLowerCase() === "admin") {
    // Only allow login if email is exactly 'admin@gmail.com'
    if (email.toLowerCase() !== 'admin@gmail.com') {
      return res.status(401).json({ success: false, message: 'Invalid admin email/password.' });
    }
    user = players.find(p => p.nameCode.toLowerCase() === "admin" && p.isAdmin);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    if (!user.email) {
      user.email = email;
      fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
    }
    return res.json({ success: true, nameCode: user.nameCode, email: user.email });
  } else {
    // Match ignoring all spaces and case
    const normalize = s => (s || '').replace(/\s+/g, '').toLowerCase();
    user = players.find(p => !p.isAdmin && normalize(p.nameCode) === normalize(nameCode));
    if (!user) {
      return res.status(404).json({ success: false, message: 'NameCode not found or not a player.' });
    }
    if (!user.email) {
      user.email = email;
      fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
    }
    return res.json({ success: true, nameCode: user.nameCode, email: user.email });
  }
};
