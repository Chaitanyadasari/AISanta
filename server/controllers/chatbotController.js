const { AzureOpenAI } = require('openai');

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'santa-chat';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

// Initialize Azure OpenAI client
let azureClient = null;
const useAzureAI = AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY;

if (useAzureAI) {
  const options = {
    endpoint: AZURE_OPENAI_ENDPOINT,
    apiKey: AZURE_OPENAI_KEY,
    deployment: AZURE_OPENAI_DEPLOYMENT,
    apiVersion: AZURE_OPENAI_API_VERSION
  };
  azureClient = new AzureOpenAI(options);
  console.log('✅ Chatbot Azure OpenAI initialized');
} else {
  console.log('⚠️  Chatbot using template responses (no Azure OpenAI)');
}

// Call Azure OpenAI with conversation context
async function callAzureAI(systemPrompt, userPrompt, temperature = 0.7, conversationHistory = []) {
  if (!azureClient) {
    throw new Error('Azure OpenAI not configured');
  }

  // Build messages array with conversation history
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // Add recent conversation history (last 5 messages for context)
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      if (msg.userId === 'santa-bot') {
        messages.push({ role: 'assistant', content: msg.message });
      } else {
        messages.push({ role: 'user', content: `${msg.username}: ${msg.message}` });
      }
    }
  }

  // Add current user prompt
  messages.push({ role: 'user', content: userPrompt });

  const result = await azureClient.chat.completions.create({
    messages: messages,
    model: 'gpt-4o-mini',
    temperature: temperature,
    max_tokens: 500,
    top_p: 0.95,
  });

  return result.choices[0].message.content;
}

// Chatbot command detection
const detectCommand = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Gift suggestion commands
  if (lowerMessage.includes('gift idea') || lowerMessage.includes('suggest gift') || lowerMessage.includes('what should i get')) {
    return { type: 'gift_suggestion', message };
  }
  
  // Holiday message commands
  if (lowerMessage.includes('holiday message') || lowerMessage.includes('send greeting') || lowerMessage.includes('create message')) {
    return { type: 'holiday_message', message };
  }
  
  // Help command
  if (lowerMessage === 'help' || lowerMessage === '!help' || lowerMessage.includes('what can you do')) {
    return { type: 'help', message };
  }
  
  // General Santa response
  if (lowerMessage.includes('santa') || lowerMessage.includes('🎅')) {
    return { type: 'santa_chat', message };
  }
  
  return null;
};

// Parse gift suggestion from message
const parseGiftRequest = (message) => {
  const lowerMessage = message.toLowerCase();
  let recipientName = 'your recipient';
  let interests = '';
  let budget = '';
  
  // Try to extract recipient name
  const forMatch = message.match(/for\s+([a-zA-Z\s]+?)(?:\s+who|,|\.|\s*$)/i);
  if (forMatch) {
    recipientName = forMatch[1].trim();
  }
  
  // Try to extract interests
  const interestsMatch = message.match(/(?:likes?|interested? in|enjoys?)\s+([a-zA-Z\s,]+?)(?:\.|,|\s*$)/i);
  if (interestsMatch) {
    interests = interestsMatch[1].trim();
  }
  
  // Try to extract budget
  const budgetMatch = message.match(/(?:budget|spend|under|around)\s+(\$?\d+)/i);
  if (budgetMatch) {
    budget = budgetMatch[1];
  }
  
  return { recipientName, interests, budget };
};

// Parse holiday message request
const parseMessageRequest = (message) => {
  let recipientName = 'your recipient';
  let tone = 'heartfelt';
  
  // Try to extract recipient name
  const forMatch = message.match(/for\s+([a-zA-Z\s]+?)(?:\s+|,|\.|\s*$)/i);
  if (forMatch) {
    recipientName = forMatch[1].trim();
  }
  
  // Detect tone
  if (message.toLowerCase().includes('funny')) tone = 'funny';
  else if (message.toLowerCase().includes('formal')) tone = 'formal';
  else if (message.toLowerCase().includes('casual')) tone = 'casual';
  
  return { recipientName, tone };
};

const chatbotController = {
  // Export Azure AI caller for use in routes
  callAzureAI: callAzureAI,
  useAzureAI: useAzureAI,
  
  async processMessage(messageText, userName, chatHistory = []) {
    try {
      const command = detectCommand(messageText);
      
      // If no command detected, return null (regular message)
      if (!command) {
        return null;
      }
      
      switch (command.type) {
        case 'help':
          return {
            response: `🎅 **Santa's AI Helper Commands:**\n\n` +
              `• Ask for **gift ideas**: "Suggest a gift for [name] who likes [interests]"\n` +
              `• Generate **holiday messages**: "Create a holiday message for [name]"\n` +
              `• Chat with **Santa**: Just mention "Santa" in your message!\n` +
              `• Get **help**: Type "help" anytime\n\n` +
              `Try asking: "Suggest a gift for John who likes gaming under $50"`,
            isBot: true,
          };
        
        case 'gift_suggestion':
          const giftParams = parseGiftRequest(messageText);
          console.log('🎁 Gift suggestion request:', giftParams);
          
          if (useAzureAI) {
            try {
              const systemPrompt = `You are Santa's gift advisor. Provide 4-5 specific, creative gift ideas with brief descriptions. Format as a numbered list. Be helpful and remember previous conversation context.`;
              const userPrompt = `Suggest Secret Santa gifts for ${giftParams.recipientName}.
${giftParams.interests ? `They like: ${giftParams.interests}` : ''}
${giftParams.budget ? `Budget: ${giftParams.budget}` : 'Budget: $20-50'}`;

              console.log('🤖 Calling Azure AI for gift suggestions...');
              const aiResponse = await callAzureAI(systemPrompt, userPrompt, 0.6, chatHistory);
              console.log('✅ Azure AI gift response received');
              return {
                response: `🎁 **Gift ideas for ${giftParams.recipientName}**:\n\n${aiResponse}`,
                isBot: true,
              };
            } catch (error) {
              console.error('❌ Azure AI error in gift_suggestion:', error.message);
              console.error('Full error:', error);
            }
          } else {
            console.log('⚠️  Using fallback gifts (Azure not configured)');
          }
          
          // Fallback
          const suggestions = [
            `A personalized gift basket`,
            `A cozy holiday sweater`,
            `Gift cards to favorite stores`,
            giftParams.interests ? `Something related to ${giftParams.interests}` : 'A thoughtful handmade item',
          ];
          return {
            response: `🎁 **Gift ideas for ${giftParams.recipientName}**:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
            isBot: true,
          };
        
        case 'holiday_message':
          const messageParams = parseMessageRequest(messageText);
          
          if (useAzureAI) {
            try {
              const systemPrompt = `You are Santa. Write a brief ${messageParams.tone} holiday message (2-3 sentences) with emojis. Consider any context from previous messages.`;
              const userPrompt = `Write a ${messageParams.tone} holiday message for ${messageParams.recipientName}.`;

              const aiResponse = await callAzureAI(systemPrompt, userPrompt, 0.9, chatHistory);
              return {
                response: aiResponse,
                isBot: true,
              };
            } catch (error) {
              console.error('Azure AI error, using fallback:', error.message);
            }
          }
          
          // Fallback
          const messages = {
            funny: `🎄 Hey ${messageParams.recipientName}! Hope your holidays are awesome! 🎅😄`,
            heartfelt: `✨ Dear ${messageParams.recipientName}, wishing you a magical holiday season! 🎁💖`,
            formal: `Season's Greetings ${messageParams.recipientName}. Wishing you joy and peace. 🎄`,
            casual: `Hey ${messageParams.recipientName}! Happy Holidays! 🎉🎁`,
          };
          return {
            response: messages[messageParams.tone] || messages.heartfelt,
            isBot: true,
          };
        
        case 'santa_chat':
          if (useAzureAI) {
            try {
              const systemPrompt = `You are Santa Claus helping with a Secret Santa gift exchange. Be jolly, festive, and helpful. Keep responses brief (2-3 sentences) with emojis. Pay attention to conversation context and remember what was discussed.`;
              const userPrompt = `${userName} says: "${messageText}"`;

              console.log('🎅 Calling Azure AI for santa_chat...');
              const aiResponse = await callAzureAI(systemPrompt, userPrompt, 0.7, chatHistory);
              console.log('✅ Azure AI responded successfully');
              return {
                response: aiResponse,
                isBot: true,
              };
            } catch (error) {
              console.error('❌ Azure AI error in santa_chat:', error.message);
              console.error('Full error:', error);
            }
          } else {
            console.log('⚠️  Azure AI not configured, using fallback');
          }
          
          // Fallback
          return {
            response: `Ho ho ho! 🎅 ${userName}, I'm here to help with your Secret Santa! How can I assist you today?`,
            isBot: true,
          };
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return {
        response: '🎅 Oops! Santa\'s helper is having technical difficulties. Please try again!',
        isBot: true,
        error: true,
      };
    }
  },
};

module.exports = chatbotController;