#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Load environment from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Data file paths (relative to parent server directory)
const PLAYERS_PATH = join(__dirname, '..', 'server', 'models', 'players.json');
const ASSIGNMENTS_PATH = join(__dirname, '..', 'server', 'models', 'assignments.json');
const MESSAGES_PATH = join(__dirname, '..', 'server', 'models', 'messages.json');

// Helper functions to read data
async function readJSONFile(path) {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${path}:`, error.message);
    return null;
  }
}

async function writeJSONFile(path, data) {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${path}:`, error.message);
    return false;
  }
}

// Azure OpenAI integration
import { AzureOpenAI } from 'openai';

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
}

async function callSantaAI(message, context = '') {
  if (!azureClient) {
    return '🎅 Santa AI is not configured. Please set Azure OpenAI credentials.';
  }

  try {
    const result = await azureClient.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are Santa Claus helping with Secret Santa gift exchange. Be jolly, helpful, and festive. Keep responses brief (2-4 sentences) with emojis.' + (context ? ` Context: ${context}` : '')
        },
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

class SantaAIMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'santa-ai-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'chat_with_santa',
          description: 'Chat with Santa AI for gift suggestions, holiday messages, or general Secret Santa advice',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Your message to Santa AI',
              },
              context: {
                type: 'string',
                description: 'Optional context about the request',
              },
            },
            required: ['message'],
          },
        },
        {
          name: 'get_gift_suggestions',
          description: 'Get AI-powered gift suggestions for someone based on their interests and budget',
          inputSchema: {
            type: 'object',
            properties: {
              recipient_name: {
                type: 'string',
                description: 'Name of the gift recipient',
              },
              interests: {
                type: 'string',
                description: 'Hobbies, interests, or likes of the recipient',
              },
              budget: {
                type: 'string',
                description: 'Budget for the gift (e.g., "$20-50", "under $30")',
              },
            },
            required: ['recipient_name'],
          },
        },
        {
          name: 'create_holiday_message',
          description: 'Generate a personalized holiday message',
          inputSchema: {
            type: 'object',
            properties: {
              recipient_name: {
                type: 'string',
                description: 'Name of the message recipient',
              },
              tone: {
                type: 'string',
                enum: ['funny', 'heartfelt', 'formal', 'casual'],
                description: 'Tone of the message',
              },
            },
            required: ['recipient_name'],
          },
        },
        {
          name: 'add_player',
          description: 'Add a new player to the Secret Santa game',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Player full name',
              },
              email: {
                type: 'string',
                description: 'Player email address',
              },
            },
            required: ['name', 'email'],
          },
        },
        {
          name: 'list_players',
          description: 'List all players in the Secret Santa game',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_assignment',
          description: 'Get Secret Santa assignment for a specific player',
          inputSchema: {
            type: 'object',
            properties: {
              name_code: {
                type: 'string',
                description: 'Player name code or username',
              },
            },
            required: ['name_code'],
          },
        },
        {
          name: 'get_chat_history',
          description: 'Get recent chat messages from the group chat',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of messages to retrieve (default: 10)',
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'chat_with_santa':
            const response = await callSantaAI(args.message, args.context);
            return {
              content: [{ type: 'text', text: response }],
            };

          case 'get_gift_suggestions':
            const giftPrompt = `Suggest 5 creative Secret Santa gifts for ${args.recipient_name}.
${args.interests ? `They like: ${args.interests}` : ''}
${args.budget ? `Budget: ${args.budget}` : 'Budget: $20-50'}

Provide a numbered list with brief descriptions.`;
            const giftResponse = await callSantaAI(giftPrompt);
            return {
              content: [{ 
                type: 'text', 
                text: `🎁 **Gift Suggestions for ${args.recipient_name}**\n\n${giftResponse}` 
              }],
            };

          case 'create_holiday_message':
            const tone = args.tone || 'heartfelt';
            const messagePrompt = `Write a ${tone} holiday message for ${args.recipient_name}. Keep it brief (2-3 sentences) with emojis.`;
            const messageResponse = await callSantaAI(messagePrompt);
            return {
              content: [{ type: 'text', text: messageResponse }],
            };

          case 'add_player':
            const players = await readJSONFile(PLAYERS_PATH) || { players: [] };
            
            // Check if player already exists
            const exists = players.players.some(
              p => p.email === args.email || p.name === args.name
            );
            
            if (exists) {
              return {
                content: [{ 
                  type: 'text', 
                  text: `❌ Player ${args.name} already exists!` 
                }],
                isError: true,
              };
            }

            // Generate username and name code
            const username = args.email.split('@')[0];
            const nameCode = args.name.toUpperCase().replace(/\s+/g, '');
            
            players.players.push({
              name: args.name,
              email: args.email,
              username: username,
              nameCode: nameCode,
              password: 'temp123', // Temporary password
            });

            await writeJSONFile(PLAYERS_PATH, players);
            
            return {
              content: [{ 
                type: 'text', 
                text: `✅ Added ${args.name} (${args.email})\nUsername: ${username}\nName Code: ${nameCode}\nTemp Password: temp123` 
              }],
            };

          case 'list_players':
            const allPlayers = await readJSONFile(PLAYERS_PATH) || { players: [] };
            const playerList = allPlayers.players
              .map((p, i) => `${i + 1}. ${p.name} (${p.email}) - Code: ${p.nameCode}`)
              .join('\n');
            
            return {
              content: [{ 
                type: 'text', 
                text: `👥 **Secret Santa Players (${allPlayers.players.length})**\n\n${playerList || 'No players yet'}` 
              }],
            };

          case 'get_assignment':
            const assignments = await readJSONFile(ASSIGNMENTS_PATH) || { assignments: {} };
            const assignment = assignments.assignments[args.name_code];
            
            if (!assignment) {
              return {
                content: [{ 
                  type: 'text', 
                  text: `❌ No assignment found for ${args.name_code}. Assignments may not be generated yet.` 
                }],
              };
            }
            
            return {
              content: [{ 
                type: 'text', 
                text: `🎁 **Secret Santa Assignment**\n\n${args.name_code} is giving a gift to: **${assignment}**` 
              }],
            };

          case 'get_chat_history':
            const messages = await readJSONFile(MESSAGES_PATH) || { messages: [] };
            const limit = args.limit || 10;
            const recentMessages = messages.messages.slice(-limit);
            
            const chatHistory = recentMessages
              .map(m => `**${m.username}** (${new Date(m.timestamp).toLocaleString()}): ${m.message}`)
              .join('\n\n');
            
            return {
              content: [{ 
                type: 'text', 
                text: `💬 **Recent Chat Messages (${recentMessages.length})**\n\n${chatHistory || 'No messages yet'}` 
              }],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `❌ Error: ${error.message}` 
          }],
          isError: true,
        };
      }
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'santa://players/list',
          name: 'All Players',
          description: 'Complete list of all Secret Santa players',
          mimeType: 'application/json',
        },
        {
          uri: 'santa://assignments/all',
          name: 'All Assignments',
          description: 'All Secret Santa gift assignments',
          mimeType: 'application/json',
        },
        {
          uri: 'santa://chat/messages',
          name: 'Chat Messages',
          description: 'Group chat message history',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'santa://players/list':
            const players = await readJSONFile(PLAYERS_PATH);
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(players, null, 2),
              }],
            };

          case 'santa://assignments/all':
            const assignments = await readJSONFile(ASSIGNMENTS_PATH);
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(assignments, null, 2),
              }],
            };

          case 'santa://chat/messages':
            const messages = await readJSONFile(MESSAGES_PATH);
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(messages, null, 2),
              }],
            };

          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        throw new Error(`Failed to read resource: ${error.message}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Santa AI MCP Server running on stdio');
    console.error('Available tools: chat_with_santa, get_gift_suggestions, create_holiday_message, add_player, list_players, get_assignment, get_chat_history');
  }
}

const server = new SantaAIMCPServer();
server.run().catch(console.error);