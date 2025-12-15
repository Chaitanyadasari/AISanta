const messagesDB = require('../db/messagesDB');

async function getMessageHistory(limit = 100) {
  try {
    return await messagesDB.getMessageHistory(limit);
  } catch (error) {
    console.error('Error getting message history:', error);
    return [];
  }
}

async function saveMessage(messageData) {
  try {
    return await messagesDB.saveMessage(messageData);
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
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