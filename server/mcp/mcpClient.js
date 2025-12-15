const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');
const path = require('path');

class AISantaMCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Get the server path with explicit directory check
      const currentDir = __dirname || path.dirname(require.main.filename);
      const serverPath = path.resolve(currentDir, 'mcpServer.js');
      
      console.log('MCP Client connecting...');
      console.log('  Server path:', serverPath);
      console.log('  Node path:', process.execPath);
      
      // Spawn the MCP server process using the current Node.js executable
      const serverProcess = spawn(process.execPath, [serverPath], {
        stdio: ['pipe', 'pipe', process.stderr],
        cwd: currentDir,
        windowsHide: true,
      });

      // Handle server process errors
      serverProcess.on('error', (err) => {
        console.error('MCP Server process error:', err);
        this.isConnected = false;
      });

      // Create transport
      this.transport = new StdioClientTransport({
        reader: serverProcess.stdout,
        writer: serverProcess.stdin,
      });

      // Create and connect client
      this.client = new Client(
        {
          name: 'aisanta-chat-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log('✅ MCP Client connected to AISanta server');

      // Handle process termination
      serverProcess.on('exit', (code) => {
        if (code !== 0) {
          console.log(`MCP Server process exited with code ${code}`);
        }
        this.isConnected = false;
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to connect MCP client:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('MCP Client disconnected');
    }
  }

  async generateSantaResponse(userMessage, userName, context = '') {
    if (!this.isConnected) {
      throw new Error('MCP Client is not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'generate_santa_response',
        arguments: {
          userMessage,
          userName,
          context,
        },
      });

      if (result.content && result.content.length > 0) {
        return result.content[0].text;
      }

      return 'Ho ho ho! 🎅 I seem to be having trouble responding right now!';
    } catch (error) {
      console.error('Error generating Santa response:', error);
      throw error;
    }
  }

  async suggestGiftIdeas(recipientName, interests = '', budget = '') {
    if (!this.isConnected) {
      throw new Error('MCP Client is not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'suggest_gift_ideas',
        arguments: {
          recipientName,
          interests,
          budget,
        },
      });

      if (result.content && result.content.length > 0) {
        return result.content[0].text;
      }

      return 'Sorry, I could not generate gift suggestions at this time.';
    } catch (error) {
      console.error('Error suggesting gift ideas:', error);
      throw error;
    }
  }

  async generateHolidayMessage(recipientName, tone = 'heartfelt') {
    if (!this.isConnected) {
      throw new Error('MCP Client is not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'generate_holiday_message',
        arguments: {
          recipientName,
          tone,
        },
      });

      if (result.content && result.content.length > 0) {
        return result.content[0].text;
      }

      return 'Happy Holidays! 🎄';
    } catch (error) {
      console.error('Error generating holiday message:', error);
      throw error;
    }
  }

  async listTools() {
    if (!this.isConnected) {
      throw new Error('MCP Client is not connected');
    }

    try {
      const result = await this.client.listTools();
      return result.tools;
    } catch (error) {
      console.error('Error listing tools:', error);
      throw error;
    }
  }
}

// Singleton instance
let mcpClientInstance = null;

async function getMCPClient() {
  if (!mcpClientInstance) {
    mcpClientInstance = new AISantaMCPClient();
    await mcpClientInstance.connect();
  } else if (!mcpClientInstance.isConnected) {
    await mcpClientInstance.connect();
  }
  return mcpClientInstance;
}

module.exports = {
  AISantaMCPClient,
  getMCPClient,
};