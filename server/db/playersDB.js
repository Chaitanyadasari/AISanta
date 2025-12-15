const { getContainer } = require('./cosmosdb');

// Get all players
async function getAllPlayers() {
  try {
    const container = await getContainer('players');
    const { resources: players } = await container.items.readAll().fetchAll();
    return { players };
  } catch (error) {
    console.error('Error getting players:', error);
    throw error;
  }
}

// Get player by email
async function getPlayerByEmail(email) {
  try {
    const container = await getContainer('players');
    const querySpec = {
      query: 'SELECT * FROM players p WHERE p.email = @email',
      parameters: [{ name: '@email', value: email }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
  } catch (error) {
    console.error('Error getting player by email:', error);
    throw error;
  }
}

// Get player by username
async function getPlayerByUsername(username) {
  try {
    const container = await getContainer('players');
    const querySpec = {
      query: 'SELECT * FROM players p WHERE LOWER(p.username) = LOWER(@username)',
      parameters: [{ name: '@username', value: username }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
  } catch (error) {
    console.error('Error getting player by username:', error);
    throw error;
  }
}

// Get player by name code
async function getPlayerByNameCode(nameCode) {
  try {
    const container = await getContainer('players');
    const querySpec = {
      query: 'SELECT * FROM players p WHERE p.nameCode = @nameCode',
      parameters: [{ name: '@nameCode', value: nameCode }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
  } catch (error) {
    console.error('Error getting player by name code:', error);
    throw error;
  }
}

// Add new player
async function addPlayer(playerData) {
  try {
    const container = await getContainer('players');
    
    // Check if player already exists
    const existingByEmail = await getPlayerByEmail(playerData.email);
    if (existingByEmail) {
      throw new Error('Player with this email already exists');
    }
    
    const existingByUsername = await getPlayerByUsername(playerData.username);
    if (existingByUsername) {
      throw new Error('Player with this username already exists');
    }
    
    const existingByNameCode = await getPlayerByNameCode(playerData.nameCode);
    if (existingByNameCode) {
      throw new Error('Player with this name code already exists');
    }
    
    const newPlayer = {
      id: playerData.email, // Use email as unique ID
      ...playerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.items.create(newPlayer);
    return resource;
  } catch (error) {
    console.error('Error adding player:', error);
    throw error;
  }
}

// Update player
async function updatePlayer(email, updates) {
  try {
    const container = await getContainer('players');
    const existingPlayer = await getPlayerByEmail(email);
    
    if (!existingPlayer) {
      throw new Error('Player not found');
    }
    
    const updatedPlayer = {
      ...existingPlayer,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.item(existingPlayer.id, email).replace(updatedPlayer);
    return resource;
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}

// Delete player
async function deletePlayer(email) {
  try {
    const container = await getContainer('players');
    const player = await getPlayerByEmail(email);
    
    if (!player) {
      throw new Error('Player not found');
    }
    
    await container.item(player.id, email).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}

// Update player password
async function updatePlayerPassword(email, hashedPassword) {
  try {
    return await updatePlayer(email, { password: hashedPassword });
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

module.exports = {
  getAllPlayers,
  getPlayerByEmail,
  getPlayerByUsername,
  getPlayerByNameCode,
  addPlayer,
  updatePlayer,
  deletePlayer,
  updatePlayerPassword,
};