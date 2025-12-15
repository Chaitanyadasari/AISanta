# 🤖 Azure AI Foundry Setup for AISanta

## 📋 What is Azure AI Foundry?

Azure AI Foundry (formerly Azure AI Studio) is Microsoft's unified platform for AI development. It's easier to use than Azure OpenAI service and includes:
- ✅ Model catalog with GPT-3.5, GPT-4, and more
- ✅ Simpler deployment process
- ✅ Built-in testing playground
- ✅ Same pricing as Azure OpenAI

---

## Step 1: Access Azure AI Foundry

### Go to Azure AI Foundry:
1. **Visit**: https://ai.azure.com
2. **Sign in** with your Azure account

---

## Step 2: Create a Project

### In Azure AI Foundry:
1. **Click**: "New project"
2. **Fill in**:
   - **Project name**: `aisanta-bot`
   - **Hub**: Create new or select existing
   - **Subscription**: Your Azure subscription
   - **Resource group**: Same as your app (or create new)
   - **Region**: Any available region

3. **Click**: "Create"

---

## Step 3: Deploy a Model

### From your project:
1. **Click**: "Deployments" in left menu
2. **Click**: "+ Create deployment" or "Deploy model"
3. **Select model**: 
   - Search for **"gpt-35-turbo"** (recommended - cheaper!)
   - Or **"gpt-4"** (more expensive but better)

4. **Deployment settings**:
   - **Deployment name**: `santa-chat` (remember this!)
   - **Deployment type**: Standard
   - **Tokens per minute**: 10K (can increase later)
   - **Content filter**: Default

5. **Click**: "Deploy"

---

## Step 4: Get Your Credentials

### Method 1: From Deployment Page
1. Click on your deployment (`santa-chat`)
2. Click "Consume" tab
3. You'll see:
   - **Endpoint**: Copy this (looks like: `https://xxx.openai.azure.com/`)
   - **Key**: Copy KEY 1
   - **Deployment name**: Your deployment name

### Method 2: From Project Settings
1. Click "Settings" (gear icon)
2. Click "Keys and endpoint"
3. Copy endpoint and key

---

## Step 5: Add to .env File

Add these to your `.env` file:

```env
# Azure AI Foundry Configuration
AZURE_OPENAI_ENDPOINT=https://your-project.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=santa-chat
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Replace**:
- `your-project.openai.azure.com` with your actual endpoint
- `your-key-here` with your actual key
- `santa-chat` with your deployment name (if different)

---

## Step 6: Test Your Deployment

### In Azure AI Foundry:
1. Go to your deployment
2. Click "Test" or "Playground"
3. Try typing: "You are Santa. Say hello!"
4. If you get a response, it's working! ✅

---

## Step 7: Update Your Code (Already Done!)

Good news: The code I wrote works with both Azure OpenAI AND Azure AI Foundry!  
They use the same API, so no code changes needed. 🎉

---

## 💰 Pricing (Same as Azure OpenAI)

### GPT-3.5-Turbo (Recommended):
- **Input**: $0.0015 per 1K tokens
- **Output**: $0.002 per 1K tokens
- **Your app**: ~$5-10/month

### GPT-4 (If you want better quality):
- **Input**: $0.03 per 1K tokens  
- **Output**: $0.06 per 1K tokens
- **Your app**: ~$30-50/month

---

## 🔧 Troubleshooting

### Can't find Azure AI Foundry?
- Go directly to: https://ai.azure.com
- Sign in with your Azure credentials

### Don't see models to deploy?
- Make sure your Azure subscription is active
- Some regions have more models available
- Try switching regions if needed

### Deployment failed?
- Check your quota limits in Azure
- Try a different region
- Start with gpt-35-turbo (better availability)

### Getting 401/403 errors?
- Verify your key is correct (copy from "Consume" tab)
- Make sure endpoint includes `https://`
- Check deployment name matches exactly

---

## 🚀 Next Steps

After setup:

1. ✅ Add credentials to `.env`
2. ✅ Restart your server: `npm start`
3. ✅ Look for: `✅ Azure OpenAI client initialized`
4. ✅ Test in chat: Type `help`
5. ✅ Bot responds with AI intelligence!

---

## 🎁 Benefits of Azure AI Foundry

✅ **Easier to use** than Azure OpenAI Service  
✅ **Better UI** for managing deployments  
✅ **Same API** - works with existing code  
✅ **Playground** for testing  
✅ **Model catalog** to browse options  
✅ **Same pricing** as Azure OpenAI  

Perfect for your Santa bot! 🎅

---

## 📝 Example .env

```env
# Your existing config
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000

# NEW: Azure AI Foundry
AZURE_OPENAI_ENDPOINT=https://aisanta-project.openai.azure.com/
AZURE_OPENAI_KEY=abc123def456ghi789
AZURE_OPENAI_DEPLOYMENT=santa-chat
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

That's it! Your bot will now use real AI from Azure AI Foundry! 🤖🎄