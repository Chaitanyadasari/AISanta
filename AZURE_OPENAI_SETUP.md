# 🤖 Azure OpenAI Integration Guide for AISanta

## 📋 Prerequisites
- ✅ Azure account (you have this)
- ✅ App deployed on Azure (you have this)
- ⏳ Azure OpenAI resource (we'll set this up)

---

## Step 1: Create Azure OpenAI Resource

### In Azure Portal:

1. **Go to**: https://portal.azure.com
2. **Click**: "Create a resource"
3. **Search**: "Azure OpenAI"
4. **Click**: "Create"

### Fill in details:
- **Subscription**: Your subscription
- **Resource Group**: Same as your app (or create new)
- **Region**: Choose one that has GPT-4 (e.g., East US, Sweden Central)
- **Name**: `aisanta-openai` (or your choice)
- **Pricing Tier**: Standard S0

5. **Click**: "Review + Create" → "Create"
6. **Wait**: 2-3 minutes for deployment

---

## Step 2: Deploy a Model

### After resource is created:

1. **Go to**: Your Azure OpenAI resource
2. **Click**: "Model deployments" (left menu)
3. **Click**: "Create new deployment"

### Deployment settings:
- **Model**: `gpt-4` or `gpt-35-turbo` (cheaper)
- **Deployment name**: `santa-chat` (remember this!)
- **Model version**: Latest available
- **Deployment type**: Standard
- **Tokens per minute rate limit**: 10K (or higher)

4. **Click**: "Create"

---

## Step 3: Get Your Credentials

### Get Endpoint:
1. In your Azure OpenAI resource
2. Click "Keys and Endpoint" (left menu)
3. Copy **Endpoint** (looks like: `https://your-name.openai.azure.com/`)

### Get API Key:
1. Same page
2. Copy **KEY 1** (keep this secret!)

---

## Step 4: Add to Your .env File

Add these to your `.env` file:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-name.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=santa-chat
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Important**: 
- Replace `your-name` with your actual endpoint
- Replace `your-key-here` with your actual KEY 1
- Use the deployment name you chose (e.g., `santa-chat`)

---

## Step 5: Update Your Code

I'll update your `mcpServer.js` to use Azure OpenAI!

The bot will now:
- ✅ Use real GPT-4 intelligence
- ✅ Generate creative gift ideas
- ✅ Write personalized messages
- ✅ Chat naturally as Santa
- ✅ Remember context in conversations

---

## 💰 Costs

### Pricing (approximate):
- **GPT-4**: ~$0.03 per 1K tokens (~750 words)
- **GPT-3.5-Turbo**: ~$0.002 per 1K tokens (much cheaper!)

### Example usage:
- 100 messages/day × 30 days = 3,000 messages/month
- **With GPT-3.5-Turbo**: ~$5-10/month
- **With GPT-4**: ~$30-50/month

For Secret Santa app, expect minimal costs (maybe $5-20/month total).

---

## 🔒 Security Best Practices

1. **Never commit .env** - Already in .gitignore ✅
2. **Use Azure Key Vault** (recommended for production):
   - Store keys in Azure Key Vault
   - App reads from Key Vault
   - No keys in files

3. **Set up Managed Identity** (best for Azure):
   - Your Azure app authenticates automatically
   - No keys needed at all!

---

## 🚀 Next Steps

After you've created your Azure OpenAI resource and got your credentials:

1. Add credentials to `.env`
2. I'll update `mcpServer.js` to use Azure OpenAI
3. Restart your app
4. Test with real AI responses!

**Ready? Let me know when you have:**
- ✅ Azure OpenAI resource created
- ✅ Model deployed (name?)
- ✅ Endpoint copied
- ✅ API key copied

Then I'll update the code! 🎅