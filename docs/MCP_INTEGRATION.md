# 🔌 MCP Integration with React Chatbot

## Architecture Overview

Your AI Santa chatbot now uses the **Model Context Protocol (MCP)** to communicate with AI services!

## 🏗️ How It Works

```
┌──────────────┐  HTTP    ┌──────────────┐  MCP     ┌──────────────┐  API    ┌─────────┐
│    React     │─────────→│ Node Server  │─────────→│  MCP Server  │────────→│  GPT-4  │
│  ChatWidget  │          │chatController│          │(child process)│         │ Azure   │
│              │←─────────│              │←─────────│              │←────────│         │
└──────────────┘   JSON   └──────────────┘ JSON-RPC └──────────────┘  JSON   └─────────┘
```

## 📁 File Structure

```
server/
├── mcp/
│   ├── mcpClient.js        # MCP client (connects to server)
│   └── mcpServer.js        # MCP server (handles AI calls)
├── controllers/
│   └── chatbotController.js # Routes messages through MCP
└── app.js                   # Initializes MCP on startup
```

## 🔄 Message Flow

### 1. User sends message in React
```javascript
// client/src/components/ChatWidget.js
fetch('/api/chatbot', {
  method: 'POST',
  body: JSON.stringify({ message: 'Suggest a gift for John' })
});
```

### 2. Node controller receives request
```javascript
// server/controllers/chatbotController.js
const mcpClient = await getMCPClient();
const response = await mcpClient.suggestGiftIdeas('John', 'gaming', '$50');
```

### 3. MCP client calls MCP server
```javascript
// server/mcp/mcpClient.js
await this.client.callTool({
  name: 'suggest_gift_ideas',
  arguments: { recipientName, interests, budget }
});
```

### 4. MCP server calls Azure OpenAI
```javascript
// server/mcp/mcpServer.js
const result = await azureClient.chat.completions.create({
  messages: [/* conversation history */],
  model: 'gpt-4o-mini'
});
```

### 5. Response flows back through the chain
```
GPT-4 → MCP Server → MCP Client → Controller → React
```

## 🎯 MCP Tools Available

### 1. generate_santa_response
Chat with Santa AI with conversation context.

**Input:**
- `userMessage` (required): User's message
- `userName` (required): User's name
- `context` (optional): Previous conversation

**Example:**
```javascript
mcpClient.generateSantaResponse(
  'What should I get my friend?',
  'Alice',
  'Previous messages: ...'
);
```

### 2. suggest_gift_ideas
Get AI-powered gift suggestions.

**Input:**
- `recipientName` (required): Gift recipient
- `interests` (optional): Their hobbies/interests
- `budget` (optional): Budget range

**Example:**
```javascript
mcpClient.suggestGiftIdeas(
  'John',
  'gaming, cooking',
  '$20-50'
);
```

### 3. generate_holiday_message
Create personalized holiday messages.

**Input:**
- `recipientName` (required): Message recipient
- `tone` (optional): funny/heartfelt/formal/casual

**Example:**
```javascript
mcpClient.generateHolidayMessage('Sarah', 'funny');
```

## 🔧 Configuration

### Enable/Disable MCP

Add to `.env`:
```env
# Use MCP for chatbot (default: true)
USE_MCP=true

# Azure OpenAI credentials (required for MCP)
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_DEPLOYMENT=santa-chat
```

### Fallback Behavior

If MCP fails, the chatbot automatically falls back to:
1. Direct Azure OpenAI calls (if configured)
2. Static template responses (if no AI configured)

## ✨ Benefits of MCP Integration

### 1. **Separation of Concerns**
- React doesn't know about AI complexity
- Node controller focuses on business logic
- MCP server handles AI communication

### 2. **Conversation Context**
MCP maintains conversation history for better responses:
```javascript
const context = buildConversationContext(chatHistory);
await mcpClient.generateSantaResponse(message, user, context);
```

### 3. **Reusability**
Same MCP tools work for:
- React chatbot
- Roo (VS Code AI)
- Other MCP clients

### 4. **Easy Testing**
Test MCP tools independently:
```javascript
const mcpClient = await getMCPClient();
const result = await mcpClient.suggestGiftIdeas('Test', 'books', '$30');
console.log(result);
```

### 5. **Fallback Chain**
Graceful degradation:
```
MCP → Direct Azure AI → Static responses
```

## 🐛 Troubleshooting

### MCP Server Not Starting

**Check logs:**
```bash
# Look for these messages
✅ MCP Client ready for chatbot
✅ Santa MCP Server running on stdio
```

**Common issues:**
- Missing Azure OpenAI credentials
- Port conflicts (shouldn't happen with stdio)
- Node.js version mismatch

### MCP Client Connection Failed

**Error:** `MCP Client is not connected`

**Solutions:**
1. Check MCP server path: `server/mcp/mcpServer.js`
2. Verify Node.js can spawn child processes
3. Check file permissions

### Falling Back to Azure AI

**Log:** `❌ MCP error, falling back to direct Azure AI`

This is normal! The system automatically falls back if MCP has issues.

## 📊 Monitoring

Check these log messages:

```bash
# Successful MCP flow
🎁 Gift suggestion via MCP: { recipientName: 'John', ... }
✅ MCP Client ready for chatbot
✅ Santa MCP Server running on stdio

# Fallback to Azure AI
❌ MCP error, falling back to direct Azure AI
🎁 Gift suggestion via Azure AI: { recipientName: 'John', ... }

# Static fallback
⚠️  Using static fallback responses
```

## 🚀 Production Deployment

### Azure App Service

MCP works perfectly on Azure! Just ensure:

1. **Environment variables set:**
   ```
   USE_MCP=true
   AZURE_OPENAI_ENDPOINT=...
   AZURE_OPENAI_KEY=...
   ```

2. **Node.js version:** 18+ recommended

3. **Process permissions:** Azure App Service supports child processes

### Disable MCP (if needed)

Set in Azure Portal → Configuration:
```
USE_MCP=false
```

This will use direct Azure OpenAI calls instead.

## 🎓 Understanding MCP vs Direct API

### Why Use MCP?

**Without MCP:**
```javascript
// Direct in controller - tightly coupled
const result = await azureClient.chat.completions.create({...});
```

**With MCP:**
```javascript
// Clean interface - loosely coupled
const result = await mcpClient.suggestGiftIdeas(name, interests, budget);
```

### Key Advantages:

1. **Abstraction** - Controller doesn't know about Azure OpenAI
2. **Testability** - Easy to mock MCP client
3. **Flexibility** - Swap AI providers without changing controllers
4. **Reusability** - Same tools for multiple clients
5. **Context Management** - MCP handles conversation state

## 🎉 Success!

Your React chatbot now uses MCP! Users get the same experience, but with better architecture:

- ✅ Cleaner code
- ✅ Better maintainability
- ✅ Easier testing
- ✅ Graceful fallbacks
- ✅ Conversation context

**No changes needed in React** - it just works! 🚀