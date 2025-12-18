const { AzureOpenAI } = require('openai');
const { getMCPClient } = require('../mcp/mcpClient');

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'santa-chat';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

// Feature flags
const USE_MCP = process.env.USE_MCP !== 'false'; // Enable MCP by default
const USE_AZURE_AI = AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY;

// Initialize Azure OpenAI client (fallback)
let azureClient = null;
if (USE_AZURE_AI) {
  const options = {
    endpoint: AZURE_OPENAI_ENDPOINT,
    apiKey: AZURE_OPENAI_KEY,
    deployment: AZURE_OPENAI_DEPLOYMENT,
    apiVersion: AZURE_OPENAI_API_VERSION
  };
  azureClient = new AzureOpenAI(options);
  console.log('✅ Azure OpenAI client initialized (fallback)');
}

if (USE_MCP) {
  console.log('✅ MCP integration enabled - ALL messages route through MCP');
} else {
  console.log('⚠️  MCP disabled - using direct Azure OpenAI');
}

// Build conversation context for MCP
function buildConversationContext(chatHistory) {
  if (!chatHistory || chatHistory.length === 0) return '';
  
  const recentHistory = chatHistory.slice(-5);
  const contextParts = recentHistory.map(msg => {
    if (msg.userId === 'santa-bot') {
      return `Santa: ${msg.message}`;
    }
    return `${msg.username}: ${msg.message}`;
  });
  
  return `Recent conversation:\n${contextParts.join('\n')}`;
}

// Call Azure OpenAI with conversation context (fallback method)
async function callAzureAI(systemPrompt, userPrompt, temperature = 0.7, conversationHistory = []) {
  if (!azureClient) {
    throw new Error('Azure OpenAI not configured');
  }

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

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

const chatbotController = {
  callAzureAI: callAzureAI,
  useAzureAI: USE_AZURE_AI,
  useMCP: USE_MCP,
  
  async processMessage(messageText, userName, chatHistory = []) {
    try {
      // Try MCP first if enabled
      if (USE_MCP) {
        try {
          const mcpClient = await getMCPClient();
          const context = buildConversationContext(chatHistory);
          
          console.log('🎅 Routing message through MCP');
          
          const response = await mcpClient.generateSantaResponse(
            messageText,
            userName,
            context
          );
          
          return {
            response: response,
            isBot: true,
          };
        } catch (mcpError) {
          console.error('❌ MCP error, falling back to direct Azure AI:', mcpError.message);
          // Fall through to Azure AI fallback
        }
      }
      
      // Fallback to direct Azure OpenAI if MCP disabled or failed
      if (USE_AZURE_AI) {
        console.log('🤖 Using direct Azure OpenAI (fallback)');
        
        const systemPrompt = `You are Santa Claus helping with a Secret Santa gift exchange. Be jolly, festive, and helpful. Keep responses brief (2-3 sentences) with emojis. Pay attention to conversation context and remember what was discussed.`;
        const userPrompt = `${userName} says: "${messageText}"`;

        const aiResponse = await callAzureAI(systemPrompt, userPrompt, 0.7, chatHistory);
        
        return {
          response: aiResponse,
          isBot: true,
        };
      }
      
      // Final fallback with static response
      console.log('⚠️  Using static fallback (no AI configured)');
      return {
        response: `Ho ho ho! 🎅 ${userName}, I'm here to help with your Secret Santa! Ask me for gift ideas, holiday messages, or general advice!`,
        isBot: true,
      };
      
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