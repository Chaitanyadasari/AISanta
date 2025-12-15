const bcrypt = require('bcrypt');
const playersDB = require('../db/playersDB');

const SALT_ROUNDS = 10;

exports.getNameCodes = async (req, res) => {
  try {
    const { players } = await playersDB.getAllPlayers();
    const nameCodes = players
      .filter(p => !p.isAdmin)
      .map(p => ({
        nameCode: p.nameCode,
        email: p.email,
        username: p.username
      }));
    res.json({ nameCodes });
  } catch (error) {
    console.error('Error getting name codes:', error);
    res.status(500).json({ success: false, message: 'Error retrieving players' });
  }
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
    
    // Check if player with this name already exists
    const existingByNameCode = await playersDB.getPlayerByNameCode(nameCode);
    if (existingByNameCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player with this name already exists. They may have already signed up!' 
      });
    }
    
    // Check if email already exists
    const existingByEmail = await playersDB.getPlayerByEmail(email.toLowerCase());
    if (existingByEmail) {
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
    const { players } = await playersDB.getAllPlayers();
    let finalUsername = username;
    let counter = 1;
    while (players.some(p => p.username === finalUsername)) {
      finalUsername = username + counter;
      counter++;
    }
    
    // Generate a temporary password (format: Name2025!)
    const tempPassword = nameCode.split(' ')[0] + '2025!';
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);
    
    const newPlayer = { 
      username: finalUsername,
      nameCode, 
      email: email.toLowerCase(), 
      password: hashedPassword,
      isAdmin: false 
    };
    
    await playersDB.addPlayer(newPlayer);
    
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

exports.deleteNameCode = async (req, res) => {
  try {
    const { nameCode } = req.body;
    if (!nameCode) {
      return res.status(400).json({ success: false, message: 'Player name is required' });
    }
    
    // Prevent deletion of admin
    if (nameCode.toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }
    
    const player = await playersDB.getPlayerByNameCode(nameCode);
    
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }
    
    if (player.isAdmin) {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }
    
    await playersDB.deletePlayer(player.email);
    res.json({ success: true, message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ success: false, message: 'Error deleting player' });
  }
};
