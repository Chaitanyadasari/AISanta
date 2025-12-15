const { CosmosClient } = require('@azure/cosmos');

// Cosmos DB configuration
const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING;
const COSMOS_DATABASE = process.env.COSMOS_DATABASE || 'aisanta-cosmosdb';

if (!COSMOS_CONNECTION_STRING) {
  console.error('⚠️  COSMOS_CONNECTION_STRING not configured in environment variables');
}

let client = null;
let database = null;

// Connect to Cosmos DB
async function connectDB() {
  if (database) {
    return database; // Return existing connection
  }

  try {
    console.log('🔌 Connecting to Cosmos DB...');
    client = new CosmosClient(COSMOS_CONNECTION_STRING);
    
    // Create database if it doesn't exist
    const { database: db } = await client.databases.createIfNotExists({
      id: COSMOS_DATABASE
    });
    
    database = db;
    
    console.log(`✅ Connected to Cosmos DB database: ${COSMOS_DATABASE}`);
    
    // Create containers (collections)
    await createContainers();
    
    return database;
  } catch (error) {
    console.error('❌ Cosmos DB connection error:', error.message);
    throw error;
  }
}

// Create containers (collections) if they don't exist
async function createContainers() {
  try {
    const db = await connectDB();
    
    // Create containers without provisioned throughput (use database-level shared throughput)
    // This avoids hitting the 1000 RU/s limit
    
    // Players container
    await db.containers.createIfNotExists({
      id: 'players',
      partitionKey: { paths: ['/email'] }
    }).catch(err => {
      if (!err.message.includes('already exists')) {
        console.log('⚠️  Players container:', err.message);
      }
    });
    
    // Assignments container
    await db.containers.createIfNotExists({
      id: 'assignments',
      partitionKey: { paths: ['/santa'] }
    }).catch(err => {
      if (!err.message.includes('already exists')) {
        console.log('⚠️  Assignments container:', err.message);
      }
    });
    
    // Messages container
    await db.containers.createIfNotExists({
      id: 'messages',
      partitionKey: { paths: ['/id'] }
    }).catch(err => {
      if (!err.message.includes('already exists')) {
        console.log('⚠️  Messages container:', err.message);
      }
    });
    
    console.log('✅ Cosmos DB containers ready');
  } catch (error) {
    console.log('⚠️  Some containers may need manual creation in Azure Portal');
    console.log('   Go to: Cosmos DB → Data Explorer → New Container');
  }
}

// Get container
async function getContainer(containerName) {
  const db = await connectDB();
  return db.container(containerName);
}

// Graceful shutdown
async function closeDB() {
  if (client) {
    // Cosmos DB client doesn't need explicit close
    console.log('🔌 Cosmos DB connection closed');
    client = null;
    database = null;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  getContainer,
  closeDB,
};