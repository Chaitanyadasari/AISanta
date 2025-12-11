const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const PLAYERS_FILE = path.join(__dirname, '../models/players.json');
const SALT_ROUNDS = 10;

function getPlayers() {
  return JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf-8')).players;
}

function writePlayers(players) {
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
}

exports.getNameCodes = (req, res) => {
  const players = getPlayers();
  const nameCodes = players.filter(p => !p.isAdmin).map(p => ({
    nameCode: p.nameCode,
    email: p.email,
    username: p.username
  }));
  res.json({ nameCodes });
};

exports.addNameCode = async (req, res) => {
  try {
    const { nameCode, email } = req.body;
    
    // Check nameCode, prevent duplicates and admin
    if (!nameCode || nameCode.toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Invalid name!' });
    }
    
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required!' });
    }
    
    const players = getPlayers();
    
    // Check if player with this name already exists
    if (players.some(p => p.nameCode.toLowerCase() === nameCode.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player with this name already exists. They may have already signed up!' 
      });
    }
    
    // Check if email already exists
    if (players.some(p => p.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered!' 
      });
    }
    
    // Generate username from nameCode (first name + last initial, lowercase)
    const nameParts = nameCode.trim().split(' ');
    let username = nameParts[0].toLowerCase();
    if (nameParts.length > 1) {
      username += nameParts[nameParts.length - 1][0].toLowerCase();
    }
    
    // Ensure username is unique by adding number if needed
    let finalUsername = username;
    let counter = 1;
    while (players.some(p => p.username === finalUsername)) {
      finalUsername = username + counter;
      counter++;
    }
    
    // Generate a temporary password (format: Name2025!)
    const tempPassword = nameCode.split(' ')[0] + '2025!';
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);
    
    players.push({ 
      username: finalUsername,
      nameCode, 
      email, 
      password: hashedPassword,
      isAdmin: false 
    });
    
    writePlayers(players);
    
    res.json({ 
      success: true, 
      message: `Player added successfully! Username: ${finalUsername}, Temporary password: ${tempPassword}`,
      username: finalUsername,
      tempPassword: tempPassword
    });
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ success: false, message: 'Error adding player' });
  }
};

exports.deleteNameCode = (req, res) => {
  const { nameCode } = req.body;
  if (!nameCode) {
    return res.status(400).json({ success: false, message: 'Player name is required' });
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
