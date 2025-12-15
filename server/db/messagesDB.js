const { getContainer } = require('./cosmosdb');

// Get message history with limit
async function getMessageHistory(limit = 100) {
  try {
    const container = await getContainer('messages');
    const querySpec = {
      query: 'SELECT * FROM messages m ORDER BY m.timestamp DESC OFFSET 0 LIMIT @limit',
      parameters: [{ name: '@limit', value: limit }]
    };
    const { resources: messages } = await container.items.query(querySpec).fetchAll();
    
    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error getting message history:', error);
    throw error;
  }
}

// Save a new message
async function saveMessage(messageData) {
  try {
    const container = await getContainer('messages');
    
    // Sanitize message if not from bot
    const isBotMessage = messageData.userId === 'santa-bot';
    const messageContent = isBotMessage ? messageData.message : sanitizeMessage(messageData.message);
    
    if (!messageContent || messageContent.length === 0) {
      throw new Error('Message cannot be empty');
    }
    
    // Validate message length
    const maxLength = isBotMessage ? 2000 : 500;
    if (messageContent.length > maxLength) {
      throw new Error('Message too long');
    }
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      userId: messageData.userId,
      username: messageData.username,
      nameCode: messageData.nameCode,
      message: messageContent,
      timestamp: new Date().toISOString(),
      type: 'user_message',
      createdAt: new Date().toISOString()
    };
    
    const { resource } = await container.items.create(message);
    return resource;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

// Sanitize message to prevent XSS
function sanitizeMessage(message) {
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Get messages by user ID
async function getMessagesByUser(userId, limit = 50) {
  try {
    const container = await getContainer('messages');
    const querySpec = {
      query: 'SELECT * FROM messages m WHERE m.userId = @userId ORDER BY m.timestamp DESC OFFSET 0 LIMIT @limit',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@limit', value: limit }
      ]
    };
    const { resources: messages } = await container.items.query(querySpec).fetchAll();
    
    return messages.reverse();
  } catch (error) {
    console.error('Error getting messages by user:', error);
    throw error;
  }
}

// Delete old messages (keep only last N messages)
async function cleanupOldMessages(keepCount = 500) {
  try {
    const container = await getContainer('messages');
    
    // Get total count
    const countQuery = {
      query: 'SELECT VALUE COUNT(1) FROM messages'
    };
    const { resources: countResult } = await container.items.query(countQuery).fetchAll();
    const totalCount = countResult[0];
    
    if (totalCount <= keepCount) {
      return { deleted: 0 };
    }
    
    // Get messages to delete (oldest ones)
    const querySpec = {
      query: `SELECT m.id FROM messages m ORDER BY m.timestamp ASC OFFSET 0 LIMIT @limit`,
      parameters: [{ name: '@limit', value: totalCount - keepCount }]
    };
    const { resources: messagesToDelete } = await container.items.query(querySpec).fetchAll();
    
    let deletedCount = 0;
    for (const msg of messagesToDelete) {
      await container.item(msg.id, msg.id).delete();
      deletedCount++;
    }
    
    return { deleted: deletedCount };
  } catch (error) {
    console.error('Error cleaning up messages:', error);
    throw error;
  }
}

module.exports = {
  getMessageHistory,
  saveMessage,
  getMessagesByUser,
  cleanupOldMessages,
};