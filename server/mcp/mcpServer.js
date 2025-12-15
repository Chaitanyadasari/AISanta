const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const { AzureOpenAI } = require('openai');

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'santa-chat';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-04-01-preview';

class AISantaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aisanta-chatbot',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Azure OpenAI client if credentials are available
    this.useAzureAI = AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY;
    
    if (this.useAzureAI) {
      const options = {
        endpoint: AZURE_OPENAI_ENDPOINT,
        apiKey: AZURE_OPENAI_KEY,
        deployment: AZURE_OPENAI_DEPLOYMENT,
        apiVersion: AZURE_OPENAI_API_VERSION
      };
      
      this.openaiClient = new AzureOpenAI(options);
      console.error('✅ Azure OpenAI client initialized');
      console.error(`   Endpoint: ${AZURE_OPENAI_ENDPOINT}`);
      console.error(`   Deployment: ${AZURE_OPENAI_DEPLOYMENT}`);
    } else {
      console.error('⚠️  Azure OpenAI not configured - using template responses');
      console.error('   Add AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY to .env for AI responses');
    }

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async callAzureOpenAI(systemPrompt, userPrompt, temperature = 0.7) {
    if (!this.useAzureAI) {
      throw new Error('Azure OpenAI not configured');
    }

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const result = await this.openaiClient.chat.completions.create({
        messages: messages,
        model: 'gpt-4o-mini',
        temperature: temperature,
        max_tokens: 500,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return result.choices[0].message.content;
    } catch (error) {
      console.error('Azure OpenAI API error:', error.message);
      throw error;
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_santa_response',
          description: 'Generate AI-powered Santa-themed responses for chat messages',
          inputSchema: {
            type: 'object',
            properties: {
              userMessage: {
                type: 'string',
                description: 'The user message to respond to',
              },
              userName: {
                type: 'string',
                description: 'Name of the user sending the message',
              },
              context: {
                type: 'string',
                description: 'Additional context about the conversation',
              },
            },
            required: ['userMessage', 'userName'],
          },
        },
        {
          name: 'suggest_gift_ideas',
          description: 'Generate AI-powered gift suggestions based on recipient information',
          inputSchema: {
            type: 'object',
            properties: {
              recipientName: {
                type: 'string',
                description: 'Name of the gift recipient',
              },
              interests: {
                type: 'string',
                description: 'Known interests or hobbies of the recipient',
              },
              budget: {
                type: 'string',
                description: 'Budget range for the gift',
              },
            },
            required: ['recipientName'],
          },
        },
        {
          name: 'generate_holiday_message',
          description: 'Create AI-powered personalized holiday messages or greetings',
          inputSchema: {
            type: 'object',
            properties: {
              recipientName: {
                type: 'string',
                description: 'Name of the message recipient',
              },
              tone: {
                type: 'string',
                description: 'Tone of the message (funny, heartfelt, formal, casual)',
                enum: ['funny', 'heartfelt', 'formal', 'casual'],
              },
            },
            required: ['recipientName'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_santa_response':
            return await this.generateSantaResponse(args);
          case 'suggest_gift_ideas':
            return await this.suggestGiftIdeas(args);
          case 'generate_holiday_message':
            return await this.generateHolidayMessage(args);
          default:
            return {
              content: [{ type: 'text', text: `Unknown tool: ${name}` }],
              isError: true,
            };
        }
      } catch (error) {
        console.error(`Error in tool ${name}:`, error.message);
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async generateSantaResponse(args) {
    const { userMessage, userName, context } = args;
    
    if (this.useAzureAI) {
      try {
        const systemPrompt = `You are Santa Claus, a jolly and helpful assistant for a Secret Santa gift exchange application. 
You are warm, festive, and enthusiastic about helping people with their Secret Santa event.
Keep responses friendly, brief (2-3 sentences), and include holiday emojis when appropriate.`;

        const userPrompt = `${userName} says: "${userMessage}"
${context ? `Context: ${context}` : ''}

Respond as Santa would, being helpful and festive!`;

        const response = await this.callAzureOpenAI(systemPrompt, userPrompt, 0.8);
        
        return {
          content: [{ type: 'text', text: response }],
        };
      } catch (error) {
        // Fallback to template
        console.error('Falling back to template response:', error.message);
      }
    }
    
    // Fallback template response
    const response = `Ho ho ho! 🎅 ${userName}, I heard you say: "${userMessage}". ${
      context ? `I'm here to help with your Secret Santa!` : 'How can I assist you today?'
    }`;

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  async suggestGiftIdeas(args) {
    const { recipientName, interests, budget } = args;
    
    if (this.useAzureAI) {
      try {
        const systemPrompt = `You are Santa's gift advisor, helping with Secret Santa gift suggestions.
Provide 4-5 specific, creative gift ideas that are practical and thoughtful.
Format as a numbered list with brief descriptions.`;

        const userPrompt = `Suggest Secret Santa gifts for ${recipientName}.
${interests ? `They like: ${interests}` : ''}
${budget ? `Budget: ${budget}` : 'Budget: $20-50'}

Provide creative, specific gift ideas!`;

        const response = await this.callAzureOpenAI(systemPrompt, userPrompt, 0.7);
        
        return {
          content: [{ type: 'text', text: `🎁 **Gift ideas for ${recipientName}**:\n\n${response}` }],
        };
      } catch (error) {
        console.error('Falling back to template gift ideas:', error.message);
      }
    }
    
    // Fallback template
    const suggestions = [
      `A personalized gift basket with ${recipientName}'s favorite treats`,
      `A cozy holiday sweater or festive blanket`,
      `Gift cards to their favorite stores or restaurants`,
      interests ? `Something related to ${interests}` : 'A thoughtful handmade item',
    ];

    const budgetText = budget ? ` (${budget} budget)` : '';
    const response = `🎁 **Gift ideas for ${recipientName}**${budgetText}:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  async generateHolidayMessage(args) {
    const { recipientName, tone = 'heartfelt' } = args;
    
    if (this.useAzureAI) {
      try {
        const systemPrompt = `You are Santa's message writer, creating personalized holiday greetings.
Write a warm, ${tone} holiday message. Keep it brief (2-3 sentences) and include appropriate holiday emojis.`;

        const userPrompt = `Write a ${tone} holiday message for ${recipientName}.`;

        const response = await this.callAzureOpenAI(systemPrompt, userPrompt, 0.9);
        
        return {
          content: [{ type: 'text', text: response }],
        };
      } catch (error) {
        console.error('Falling back to template message:', error.message);
      }
    }
    
    // Fallback templates
    const messages = {
      funny: `🎄 Hey ${recipientName}! Santa's checking his list twice, and you're definitely on the nice list (phew!). Hope your holidays are filled with joy, laughter, and NO fruitcake! 🎅😄`,
      heartfelt: `✨ Dear ${recipientName}, wishing you a magical holiday season filled with warmth, joy, and wonderful memories. May the spirit of giving bring happiness to your heart! 🎁💖`,
      formal: `Season's Greetings ${recipientName}, May this festive season bring you peace, prosperity, and joy. Wishing you and your loved ones a wonderful holiday. 🎄`,
      casual: `Hey ${recipientName}! 🎅 Happy Holidays! Hope you have an awesome time celebrating. Enjoy the festivities! 🎉🎁`,
    };

    return {
      content: [{ type: 'text', text: messages[tone] || messages.heartfelt }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AISanta MCP server running on stdio');
  }
}

// Only run if executed directly
if (require.main === module) {
  const server = new AISantaMCPServer();
  server.run().catch(console.error);
}

module.exports = AISantaMCPServer;