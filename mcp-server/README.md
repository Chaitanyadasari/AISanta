# Santa AI MCP Server

A Model Context Protocol (MCP) server that exposes your Santa AI Secret Santa application to AI assistants like Claude Desktop, VS Code with Roo, and other MCP clients.

## 🎯 Features

### Tools (Actions)
- `chat_with_santa` - Chat with Santa AI for any Secret Santa advice
- `get_gift_suggestions` - AI-powered gift recommendations
- `create_holiday_message` - Generate personalized holiday messages
- `add_player` - Add new players to the game
- `list_players` - View all registered players
- `get_assignment` - Check Secret Santa assignments
- `get_chat_history` - View recent group chat messages

### Resources (Data)
- `santa://players/list` - All players (JSON)
- `santa://assignments/all` - All assignments (JSON)
- `santa://chat/messages` - Chat history (JSON)

## 🚀 Installation

### 1. Install Dependencies
```bash
cd mcp-server
npm install
```

### 2. Configure Environment
The MCP server automatically loads `.env` from the parent directory. Ensure these variables are set:

```env
# Azure OpenAI (for Santa AI chat)
AZURE_OPENAI_ENDPOINT=https://aisanta-bot.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=santa-chat
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

### 3. Test the Server
```bash
npm start
```

## 🔧 Configuration for AI Assistants

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "santa-ai": {
      "command": "node",
      "args": ["/absolute/path/to/AISanta/mcp-server/index.js"]
    }
  }
}
```

On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### VS Code with Roo

Add to `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "santa-ai": {
      "command": "node",
      "args": ["C:/Users/YourUser/path/to/AISanta/mcp-server/index.js"]
    }
  }
}
```

## 📖 Usage Examples

### In Claude Desktop or Roo

**Chat with Santa AI:**
```
You: Use Santa AI to suggest gifts for someone who likes cooking
Claude: 🎁 Gift Suggestions for your recipient:
1. High-quality chef's knife set
2. Cooking class subscription
3. Gourmet spice collection
...
```

**Add a Player:**
```
You: Add Sarah Johnson (sarah@email.com) to Secret Santa
Claude: ✅ Added Sarah Johnson (sarah@email.com)
Username: sarah
Name Code: SARAHJOHNSON
Temp Password: temp123
```

**Check Assignments:**
```
You: What is John's Secret Santa assignment?
Claude: 🎁 Secret Santa Assignment
JOHN is giving a gift to: **SARAH**
```

**Create Holiday Message:**
```
You: Create a funny holiday message for Mike
Claude: 🎄 Hey Mike! Hope your holidays are merrier than a reindeer at a sleigh race! 🦌🎅
```

**View Players:**
```
You: List all Secret Santa players
Claude: 👥 Secret Santa Players (8)
1. John Smith (john@email.com) - Code: JOHNSMITH
2. Sarah Johnson (sarah@email.com) - Code: SARAHJOHNSON
...
```

**Get Chat History:**
```
You: Show recent chat messages
Claude: 💬 Recent Chat Messages (10)
**John** (12/14/2025, 10:30 PM): Hey everyone!
**Sarah** (12/14/2025, 10:31 PM): Hi John!
...
```

## 🔍 Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `chat_with_santa` | General Santa AI chat | `message`, `context?` |
| `get_gift_suggestions` | Gift recommendations | `recipient_name`, `interests?`, `budget?` |
| `create_holiday_message` | Holiday message generator | `recipient_name`, `tone?` |
| `add_player` | Add new player | `name`, `email` |
| `list_players` | List all players | none |
| `get_assignment` | Get player's assignment | `name_code` |
| `get_chat_history` | Recent messages | `limit?` |

## 🗂️ Available Resources

| Resource URI | Description |
|--------------|-------------|
| `santa://players/list` | All players JSON |
| `santa://assignments/all` | All assignments JSON |
| `santa://chat/messages` | Chat history JSON |

## 🐛 Troubleshooting

**Server not connecting:**
- Check that paths in MCP config are absolute
- Verify Node.js is in PATH
- Ensure `.env` has Azure OpenAI credentials

**Tools not appearing:**
- Restart Claude Desktop / VS Code
- Check console for errors: Look at MCP server logs

**Azure AI not working:**
- Verify `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_KEY` are set
- Test the main Santa AI app first

## 🎄 What You Can Do

- **Manage your Secret Santa game from AI assistants**
- **Get gift suggestions without opening the app**
- **Automate player onboarding**
- **Create bulk holiday messages**
- **Query game state anytime**
- **Integrate with other MCP tools** (Notion, Calendar, etc.)

## 📝 Notes

- The MCP server reads/writes to the same data files as your main app
- All Santa AI chat uses your Azure OpenAI GPT-4o-mini deployment
- Player additions through MCP create accounts with temporary password "temp123"
- The server runs independently from your web app

Enjoy managing your Secret Santa with AI! 🎅🤖✨