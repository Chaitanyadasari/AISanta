// MCP Server Bridge - CommonJS version that connects to the main MCP server
const { spawn } = require('child_process');
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { AzureOpenAI } = require('openai');

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'santa-chat';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

let azureClient = null;
if (AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY) {
  azureClient = new AzureOpenAI({
    endpoint: AZURE_OPENAI_ENDPOINT,
    apiKey: AZURE_OPENAI_KEY,
    deployment: AZURE_OPENAI_DEPLOYMENT,
    apiVersion: AZURE_OPENAI_API_VERSION
  });
  console.error('✅ Azure OpenAI client initialized');
}

// Call Azure OpenAI
async function callSantaAI(message, context = '') {
  if (!azureClient) {
    return '🎅 Santa AI is not configured. Please set Azure OpenAI credentials.';
  }

  try {
    const systemContent = 'You are Santa Claus helping with Secret Santa gift exchange. Be jolly, helpful, and festive. Keep responses brief (2-4 sentences) with emojis.' + 
      (context ? ` Previous conversation context: ${context}` : '');

    const result = await azureClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 500,
    });

    return result.choices[0].message.content;
  } catch (error) {
    console.error('Azure AI error:', error.message);
    return '🎅 Ho ho ho! Santa is having technical difficulties. Please try again!';
  }
}

// Create MCP Server
class SantaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'santa-ai-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_santa_response',
          description: 'Generate a Santa response for user message with conversation context',
          inputSchema: {
            type: 'object',
            properties: {
              userMessage: {
                type: 'string',
                description: 'The user message',
              },
              userName: {
                type: 'string',
                description: 'The user name',
              },
              context: {
                type: 'string',
                description: 'Conversation context',
              },
            },
            required: ['userMessage', 'userName'],
          },
        },
        {
          name: 'suggest_gift_ideas',
          description: 'Suggest gift ideas based on recipient info',
          inputSchema: {
            type: 'object',
            properties: {
              recipientName: {
                type: 'string',
                description: 'Name of the recipient',
              },
              interests: {
                type: 'string',
                description: 'Interests or hobbies',
              },
              budget: {
                type: 'string',
                description: 'Budget range',
              },
            },
            required: ['recipientName'],
          },
        },
        {
          name: 'generate_holiday_message',
          description: 'Generate a personalized holiday message',
          inputSchema: {
            type: 'object',
            properties: {
              recipientName: {
                type: 'string',
                description: 'Name of the recipient',
              },
              tone: {
                type: 'string',
                enum: ['funny', 'heartfelt', 'formal', 'casual'],
                description: 'Tone of the message',
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
          case 'generate_santa_response': {
            const { userMessage, userName, context } = args;
            const prompt = `${userName} says: "${userMessage}"`;
            const response = await callSantaAI(prompt, context || '');
            
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          case 'suggest_gift_ideas': {
            const { recipientName, interests, budget } = args;
            const prompt = `Suggest 4-5 Secret Santa gift ideas for ${recipientName}.
${interests ? `They like: ${interests}` : ''}
${budget ? `Budget: ${budget}` : 'Budget: $20-50'}

Format as a numbered list with brief descriptions.`;
            
            const response = await callSantaAI(prompt);
            
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          case 'generate_holiday_message': {
            const { recipientName, tone } = args;
            const prompt = `Write a brief ${tone || 'heartfelt'} holiday message (2-3 sentences) for ${recipientName}. Include emojis.`;
            
            const response = await callSantaAI(prompt);
            
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error in tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Santa MCP Server running on stdio');
  }
}

// Start the server
const server = new SantaMCPServer();
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});