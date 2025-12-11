const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const PLAYERS_FILE = path.join(__dirname, '../models/players.json');
const SALT_ROUNDS = 10;

function getPlayers() {
  const data = fs.readFileSync(PLAYERS_FILE, 'utf-8');
  return JSON.parse(data).players;
}

function savePlayers(players) {
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
}

// Password strength validation
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

// Signup endpoint
exports.signup = async (req, res) => {
  try {
    const { username, email, password, nameCode } = req.body;
    
    if (!username || !email || !password || !nameCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, password, and name are required.' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }

    const players = getPlayers();
    
    // Check if username already exists
    if (players.find(p => p.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists. Please choose a different username.' 
      });
    }

    // Check if email already exists
    if (players.find(p => p.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please use a different email or login.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new player
    const newPlayer = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      nameCode: nameCode.trim(),
      isAdmin: false
    };

    players.push(newPlayer);
    savePlayers(players);

    return res.json({ 
      success: true, 
      message: 'Account created successfully!',
      username: newPlayer.username,
      nameCode: newPlayer.nameCode
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during signup. Please try again.' 
    });
  }
};

// Login endpoint with password authentication
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required.' 
      });
    }

    const players = getPlayers();
    
    // Find user by username (case-insensitive)
    const user = players.find(p => p.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }

    // Successful login
    return res.json({ 
      success: true, 
      username: user.username,
      nameCode: user.nameCode,
      email: user.email,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again.' 
    });
  }
};
