# 🎅 AI Santa - Secret Santa Gift Exchange App

A modern web application for managing Secret Santa gift exchanges with **AI-powered gift suggestions**, **real-time group chat**, and automated email notifications.

![AI Santa](https://img.shields.io/badge/Secret%20Santa-AI%20Powered-red?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-14+-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge)
![Azure AI](https://img.shields.io/badge/Azure-AI%20Foundry-0078D4?style=for-the-badge)

## ✨ Features

### 🤖 AI-Powered Features
- **🎁 Smart Gift Suggestions** - Ask Santa AI for personalized gift recommendations
- **💬 AI Chatbot** - Get holiday greetings, gift ideas, and Secret Santa advice
- **🧠 Context-Aware** - AI remembers your conversation for better responses
- **🎨 Creative Messages** - Generate personalized holiday messages

### 💬 Real-Time Communication
- **💬 Group Chat** - Real-time chat for all participants using Socket.io
- **🔔 Live Updates** - See messages instantly without refreshing
- **👥 User Presence** - Know who's online and chatting
- **🎅 Santa Bot Integration** - AI assistant available in group chat

### 🎁 Secret Santa Core Features
- **🎲 Automated Assignment Generation** - Randomly assigns Secret Santa pairs
- **📧 Email Notifications** - Automatically sends assignment emails to participants
- **👥 Player Management** - Easy to add, view, and remove participants
- **🔐 Secure Authentication** - Username/password-based login with bcrypt encryption
- **🔄 Reset & Regenerate** - Admin can reset and regenerate assignments anytime

### 🎨 User Experience
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🌟 Beautiful UI** - Modern gradient design with smooth animations
- **🔒 Secure** - Password hashing, input sanitization, XSS protection
- **☁️ Cloud Database** - Azure Cosmos DB for persistent data storage

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Azure Cosmos DB account (or use the free tier)
- Azure OpenAI or Azure AI Foundry access (for AI features)
- Gmail account for sending emails

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AISanta
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Azure AI Foundry / Azure OpenAI Configuration
   AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   AZURE_OPENAI_KEY=your_azure_openai_key
   AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   AZURE_OPENAI_API_VERSION=2025-01-01-preview
   
   # Cosmos DB Configuration
   COSMOS_CONNECTION_STRING=AccountEndpoint=https://...;AccountKey=...;
   COSMOS_DATABASE=aisanta-cosmosdb
   ```

4. **Set up Azure Cosmos DB**
   
   The app will automatically create the required containers:
   - `players` - User accounts
   - `assignments` - Secret Santa assignments
   - `messages` - Group chat messages

5. **Start the application**
   
   Development mode:
   ```bash
   # Terminal 1 - Start backend
   npm start
   
   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

6. **Access the app**
   - Open http://localhost:3000
   - Sign up or login
   - Start chatting and using AI features!

## 📖 Usage

### For Admins

1. **Login** with admin credentials
2. **Add Players** - Go to NameCodes and add participants with their names and emails
3. **Generate Assignments** - Click "Generate Assignments" to create Secret Santa pairs
4. **Email Notifications** - All participants receive their assignments via email
5. **Manage Chat** - Monitor and participate in group chat
6. **Reset** - You can reset and regenerate assignments anytime

### For Players

1. **Sign Up/Login** - Create account or login with username and password
2. **View Assignment** - See who you're the Secret Santa for
3. **Group Chat** - Chat with other participants in real-time
4. **Ask Santa AI** - Get gift suggestions and holiday messages
5. **Keep it Secret!** 🤫

### Using AI Features

#### Ask Santa AI for Gift Ideas
```
You: "What's a good gift for someone who loves cooking?"
Santa AI: "Here are some great gift ideas for a cooking enthusiast:
- Premium knife set
- Air fryer or Instant Pot
- Gourmet spice collection
- Cooking class experience
..."
```

#### Get Holiday Messages
```
You: "Write a funny holiday message"
Santa AI: "Ho ho ho! Here's a festive message: 
May your holidays be filled with more cookies than diets, 
more laughter than stress, and more joy than your credit card bill!"
```

#### General Holiday Advice
```
You: "How do I wrap an oddly shaped gift?"
Santa AI: "Great question! Here are some creative wrapping ideas..."
```

## 🌐 Deployment

### Deploy to Azure App Service

1. **Create Azure Resources**
   - Azure Cosmos DB (NoSQL API)
   - Azure App Service (Linux, Node 18+)
   - Azure OpenAI or AI Foundry resource

2. **Configure App Service**
   - Add all environment variables from `.env`
   - Enable WebSockets for real-time chat
   - Set startup command: `node server/app.js`

3. **Deploy**
   ```bash
   # Using Azure CLI
   az webapp up --name your-app-name --resource-group your-rg
   ```

4. **Configure Custom Domain** (Optional)
   - Add custom domain in Azure Portal
   - Configure SSL certificate

Your app will be live at: `https://your-app-name.azurewebsites.net`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_USER` | Gmail address for sending emails | Yes |
| `EMAIL_PASS` | Gmail app password (16 characters) | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | Yes (for AI) |
| `AZURE_OPENAI_KEY` | Azure OpenAI API key | Yes (for AI) |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name | Yes (for AI) |
| `COSMOS_CONNECTION_STRING` | Cosmos DB connection string | Yes |
| `COSMOS_DATABASE` | Cosmos DB database name | Yes |

### Gmail Setup

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in your `.env` file

### Azure AI Foundry Setup

1. Create an Azure AI Foundry hub
2. Deploy a GPT-4 or GPT-4o model
3. Get endpoint URL and API key
4. Add to environment variables

## 📁 Project Structure

```
AISanta/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Chat.js           # Group chat component
│   │   │   ├── ChatWidget.js     # AI chatbot widget
│   │   │   └── ...
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useChat.js        # Chat WebSocket hook
│   │   ├── utils/         # API utilities
│   │   │   ├── api.js            # REST API calls
│   │   │   └── socket.js         # Socket.io client
│   │   └── App.js         # Main app component
│   └── public/
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   │   ├── authController.js     # Authentication
│   │   ├── chatController.js     # Chat & AI
│   │   ├── gameController.js     # Assignments
│   │   └── playerController.js   # Player management
│   ├── db/               # Database layer
│   │   ├── cosmosdb.js          # Cosmos DB connection
│   │   ├── playersDB.js         # Players data access
│   │   ├── assignmentsDB.js     # Assignments data access
│   │   └── messagesDB.js        # Messages data access
│   ├── mcp/              # MCP integration
│   ├── socketHandlers.js # WebSocket handlers
│   ├── emailService.js   # Email functionality
│   └── app.js            # Express server
├── mcp-server/           # MCP server for AI tools
│   └── index.js          # Santa AI MCP server
├── docs/                 # Documentation
│   ├── CHAT_FEATURE_ARCHITECTURE.md
│   ├── CHAT_IMPLEMENTATION_SUMMARY.md
│   └── AZURE_AI_FOUNDRY_SETUP.md
├── .env.example          # Environment variables template
├── package.json          # Root dependencies
└── README.md             # This file
```

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Socket.io Client (real-time chat)
- CSS3 with modern gradients and animations

### Backend
- Node.js & Express
- Socket.io (WebSocket server)
- Nodemailer (email notifications)
- bcrypt (password hashing)
- Azure Cosmos DB (NoSQL database)

### AI & Cloud Services
- Azure OpenAI / Azure AI Foundry (GPT-4)
- Azure Cosmos DB (persistent storage)
- Model Context Protocol (MCP) for AI tools

## 🐛 Troubleshooting

### Email Not Sending

- Verify Gmail app password is correct
- Ensure 2-factor authentication is enabled
- Check server logs for error messages
- Test with a simple email first

### Chat Not Working

- Ensure WebSockets are enabled in deployment
- Check browser console for connection errors
- Verify server is running and accessible
- Check firewall/proxy settings

### AI Not Responding

- Verify Azure OpenAI credentials are correct
- Check API endpoint and deployment name
- Review Azure OpenAI service status
- Check server logs for API errors

### Database Issues

- Verify Cosmos DB connection string
- Check if containers are created
- Review Cosmos DB throughput limits
- Check server logs for database errors

## 🔐 Security Features

- ✅ **Password Hashing** - bcrypt with 10 rounds
- ✅ **Input Sanitization** - XSS prevention
- ✅ **Unique Constraints** - Email and username validation
- ✅ **Secure Sessions** - No plain text passwords
- ✅ **Admin Protection** - Admin-only routes
- ✅ **Rate Limiting** - Protection against abuse

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📞 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the troubleshooting section
3. Check server and browser console logs
4. Review Azure service health status

## 🎄 Happy Secret Santa! 🎅

Made with ❤️ for spreading holiday cheer with the power of AI!

---

**New Features in v2.0:**
- 🤖 AI-powered gift suggestions and chat
- 💬 Real-time group chat
- ☁️ Cloud database (Azure Cosmos DB)
- 🔐 Enhanced security with bcrypt
- 🎨 Improved UI/UX
- 📱 Better mobile responsiveness
