const fs = require('fs').promises;
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, '../models/messages.json');
const MAX_MESSAGES = 500; // Keep last 500 messages

// Initialize messages file if it doesn't exist
async function initMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2));
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

async function getMessageHistory(limit = 100) {
  await initMessagesFile();
  const data = await fs.readFile(MESSAGES_FILE, 'utf8');
  const { messages } = JSON.parse(data);
  return messages.slice(-limit); // Return last N messages
}

async function saveMessage(messageData) {
  await initMessagesFile();
  
  // Sanitize the message content
  const sanitizedMessage = sanitizeMessage(messageData.message);
  
  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  if (sanitizedMessage.length > 500) {
    throw new Error('Message too long');
  }
  
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: messageData.userId,
    username: messageData.username,
    nameCode: messageData.nameCode,
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
    type: 'user_message'
  };

  const data = await fs.readFile(MESSAGES_FILE, 'utf8');
  const json = JSON.parse(data);
  
  json.messages.push(message);
  
  // Keep only last MAX_MESSAGES
  if (json.messages.length > MAX_MESSAGES) {
    json.messages = json.messages.slice(-MAX_MESSAGES);
  }
  
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(json, null, 2));
  
  return message;
}

// REST API fallback endpoints
async function getMessages(req, res) {
  try {
    const messages = await getMessageHistory();
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
}

async function postMessage(req, res) {
  try {
    const message = await saveMessage(req.body);
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save message' });
  }
}

module.exports = {
  getMessageHistory,
  saveMessage,
  getMessages,
  postMessage
};