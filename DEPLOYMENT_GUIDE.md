# AI Santa - Deployment Guide

## Table of Contents
1. [Email Configuration](#email-configuration)
2. [Local Testing](#local-testing)
3. [Cloud Deployment Options](#cloud-deployment-options)
4. [Deployment Steps](#deployment-steps)

---

## Email Configuration

### Issue
The email service is not configured properly. You need to set up Gmail credentials.

### Setup Steps

#### Option 1: Using Gmail (Recommended for small groups)

1. **Create or use a Gmail account** for sending emails

2. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

3. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AI Santa"
   - Copy the 16-character password

4. **Update `server/emailService.js`**
   ```javascript
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'your_actual_email@gmail.com',  // Your Gmail address
       pass: 'xxxx xxxx xxxx xxxx'            // Your 16-char app password
     }
   });
   
   // Update the 'from' field as well
   function sendAssignmentEmail(to, assignedNameCode) {
     return transporter.sendMail({
       from: 'AI Santa <your_actual_email@gmail.com>',  // Same Gmail
       to,
       subject: 'Your AI Santa Assignment! 🎅',
       text: `You are the Secret Santa for: ${assignedNameCode}\n\nKeep it a secret and happy gifting! 🎁`
     });
   }
   ```

#### Option 2: Using Environment Variables (Recommended for production)

1. Create a `.env` file in the root directory:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   PORT=5000
   ```

2. Install dotenv:
   ```bash
   npm install dotenv
   ```

3. Update `server/emailService.js`:
   ```javascript
   require('dotenv').config();
   
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
     }
   });
   ```

---

## Local Testing

### Prerequisites
- Node.js (v14 or higher)
- npm

### Steps

1. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. **Configure email** (see Email Configuration section above)

3. **Start the server**
   ```bash
   node server/app.js
   ```
   Server runs on: http://localhost:5000

4. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm start
   ```
   Client runs on: http://localhost:3000

5. **Test locally**
   - Open http://localhost:3000 in your browser
   - Login with admin credentials (admin@gmail.com)
   - Add players and generate assignments

---

## Cloud Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

**Pros:**
- Free tier available
- Easy deployment
- Built-in SSL
- Good for small to medium apps

**Cons:**
- Free tier sleeps after inactivity (30 min to wake up)

### Option 2: Railway

**Pros:**
- Very easy deployment
- $5 free credit monthly
- Fast and reliable

**Cons:**
- Requires credit card for free tier

### Option 3: Heroku

**Pros:**
- Well-documented
- Reliable

**Cons:**
- No free tier anymore (starts at $5/month)

### Option 4: Azure App Service

**Pros:**
- Microsoft ecosystem
- Free tier available (F1)
- Good documentation

**Cons:**
- Slightly more complex setup

---

## Deployment Steps

### Deploying to Render (Recommended)

#### Step 1: Prepare Your Code

1. **Create start scripts**
   
   Update `package.json` in root:
   ```json
   {
     "scripts": {
       "start": "node server/app.js",
       "build": "cd client && npm install && npm run build",
       "install-all": "npm install && cd client && npm install"
     }
   }
   ```

2. **Update server to serve React build**
   
   Update `server/app.js` (add before the routes):
   ```javascript
   const path = require('path');
   
   // Serve React static files in production
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../client/build')));
     
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
     });
   }
   ```

3. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Santa app"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

#### Step 2: Deploy on Render

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: ai-santa (or your preferred name)
     - **Environment**: Node
     - **Region**: Choose closest to your users
     - **Branch**: main
     - **Build Command**: `npm run install-all && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables**
   Click "Environment" tab and add:
   - `EMAIL_USER` = your_gmail@gmail.com
   - `EMAIL_PASS` = your_app_password
   - `NODE_ENV` = production

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build and deployment
   - Your app will be live at: `https://ai-santa-xxxx.onrender.com`

#### Step 3: Share with Friends

1. Share the URL: `https://your-app-name.onrender.com`
2. Give them the admin email or have them register
3. Admin can add players and generate assignments

### Deploying to Railway

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js

3. **Configure**
   - Add environment variables in Settings → Variables:
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - `NODE_ENV=production`
   
4. **Custom Domain (Optional)**
   - Railway provides a free subdomain
   - Or connect your own domain

### Deploying to Azure

1. **Install Azure CLI**
   ```bash
   # Windows (using winget)
   winget install Microsoft.AzureCLI
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Create Resource Group**
   ```bash
   az group create --name ai-santa-rg --location eastus
   ```

4. **Create App Service Plan (Free Tier)**
   ```bash
   az appservice plan create --name ai-santa-plan --resource-group ai-santa-rg --sku F1 --is-linux
   ```

5. **Create Web App**
   ```bash
   az webapp create --resource-group ai-santa-rg --plan ai-santa-plan --name ai-santa-app --runtime "NODE|18-lts" --deployment-local-git
   ```

6. **Configure App Settings**
   ```bash
   az webapp config appsettings set --resource-group ai-santa-rg --name ai-santa-app --settings EMAIL_USER="your_email@gmail.com" EMAIL_PASS="your_app_password" NODE_ENV="production"
   ```

7. **Deploy**
   ```bash
   git remote add azure <git-url-from-step-5>
   git push azure main
   ```

---

## Important Notes

### Security Considerations

1. **Never commit credentials** - Use environment variables
2. **Add `.env` to `.gitignore`**
3. **Use HTTPS** - Most cloud providers offer free SSL
4. **Rotate passwords** - Change email app password periodically

### Database Alternative

For production use with many users, consider:
- **MongoDB Atlas** (free tier available)
- **PostgreSQL** on Render/Railway (free tier)
- **Azure Cosmos DB** (free tier available)

Currently, the app uses JSON files which work fine for small groups (<50 people).

### Troubleshooting

**Email not sending:**
- Check Gmail app password is correct
- Ensure 2-factor authentication is enabled
- Check logs for error messages
- Test with a simple email first

**App not loading:**
- Check if server is running (server logs)
- Verify client build was successful
- Check browser console for errors
- Ensure API URLs are correct

**Free tier sleeping (Render):**
- First request takes 30s-1min to wake up
- Consider upgrading to paid tier ($7/month)
- Or use Railway/Azure instead

---

## Cost Comparison

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Render | ✅ (with sleep) | $7/month |
| Railway | $5 credit/month | Pay as you go |
| Heroku | ❌ | $7/month |
| Azure | ✅ F1 tier | $13+/month |

**Recommendation for small groups:** Start with Render free tier or Railway $5 credit.

---

## Support

For issues:
1. Check server logs
2. Check browser console
3. Verify environment variables are set
4. Test email configuration locally first

---

## Next Steps

1. Configure email credentials
2. Test locally
3. Push to GitHub
4. Deploy to Render (or your preferred platform)
5. Share URL with friends
6. Have admin add all players
7. Generate assignments and enjoy! 🎅🎁