const bcrypt = require('bcrypt');
const playersDB = require('../db/playersDB');

const SALT_ROUNDS = 10;

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

    // Check if username already exists
    const existingByUsername = await playersDB.getPlayerByUsername(username.trim());
    if (existingByUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists. Please choose a different username.' 
      });
    }

    // Check if email already exists
    const existingByEmail = await playersDB.getPlayerByEmail(email.toLowerCase().trim());
    if (existingByEmail) {
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

    await playersDB.addPlayer(newPlayer);

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

    // Find user by username (case-insensitive)
    const user = await playersDB.getPlayerByUsername(username);
    
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
