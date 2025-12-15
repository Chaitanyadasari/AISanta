const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const chatController = require('../controllers/chatController');

// Santa AI chat endpoint (separate from group chat)
router.post('/chat', async (req, res) => {
  try {
    const { message, userName } = req.body;
    
    console.log('🎅 Santa AI request:', { message, userName });
    
    if (!message || !userName) {
      console.log('❌ Missing message or userName');
      return res.status(400).json({ error: 'Message and userName required' });
    }

    // Get recent chat history for context
    const chatHistory = await chatController.getMessageHistory(10);
    console.log(`📜 Retrieved ${chatHistory.length} recent messages for context`);

    // Process message through chatbot controller
    console.log('📞 Calling chatbot controller...');
    const result = await chatbotController.processMessage(message, userName, chatHistory);
    console.log('📥 Chatbot result:', result);
    
    if (result && result.response) {
      console.log('✅ Sending chatbot response');
      res.json({
        response: result.response,
        isBot: true
      });
    } else {
      // For Santa AI modal, ALWAYS use Azure AI for general chat
      console.log('🤖 No command detected, using general AI chat...');
      
      if (chatbotController.useAzureAI) {
        try {
          const systemPrompt = 'You are Santa Claus, a jolly helper for Secret Santa. Be festive, helpful, and conversational. Keep responses brief (2-3 sentences) with emojis.';
          const userPrompt = `${userName} says: "${message}"`;
          
          const aiResponse = await chatbotController.callAzureAI(systemPrompt, userPrompt, 0.8, chatHistory);
          console.log('✅ Azure AI general chat response received');
          
          res.json({
            response: aiResponse,
            isBot: true
          });
        } catch (error) {
          console.error('❌ Azure AI error in general chat:', error.message);
          throw error; // Will be caught by outer catch block
        }
      } else {
        // Fallback if no Azure configured
        console.log('⚠️  No Azure AI, using fallback');
        res.json({
          response: `🎅 Ho ho ho! I'm here to help with your Secret Santa! Try asking me for gift ideas or holiday messages. Type "help" to see what I can do!`,
          isBot: true
        });
      }
    }
  } catch (error) {
    console.error('Santa AI error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
      response: '🎅 Oops! I\'m having trouble right now. Please try again!'
    });
  }
});

module.exports = router;