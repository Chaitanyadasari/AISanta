const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const PLAYERS_FILE = path.join(__dirname, 'models/players.json');
const SALT_ROUNDS = 10;

async function hashPasswords() {
  try {
    // Read current players
    const data = fs.readFileSync(PLAYERS_FILE, 'utf-8');
    const playersData = JSON.parse(data);
    
    console.log('Starting password hashing for all players...\n');
    
    // Default password for all users
    const defaultPassword = 'AISanta2025!';
    
    // Hash passwords for all players
    for (let player of playersData.players) {
      // Skip if already has a valid bcrypt hash (not placeholder)
      if (player.password && player.password.startsWith('$2b$10$') && player.password.length > 30) {
        console.log(`✓ ${player.username} - Password already hashed (skipping)`);
        continue;
      }
      
      const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
      player.password = hashedPassword;
      console.log(`✓ ${player.username} - Password hashed successfully`);
      console.log(`  Hash: ${hashedPassword}`);
    }
    
    // Save updated players
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(playersData, null, 2));
    
    console.log('\n✅ All passwords have been hashed successfully!');
    console.log(`\nDefault password for all users: ${defaultPassword}`);
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log(`Password: ${defaultPassword}\n`);
    
    // Test admin password
    const admin = playersData.players.find(p => p.username === 'admin');
    if (admin) {
      const isValid = await bcrypt.compare(defaultPassword, admin.password);
      console.log('Admin password verification:', isValid ? '✅ VALID' : '❌ INVALID');
    }
    
  } catch (error) {
    console.error('❌ Error hashing passwords:', error);
    process.exit(1);
  }
}

hashPasswords();