# 🎅 AI Santa - Secret Santa Gift Exchange App

A beautiful web application for managing Secret Santa gift exchanges with automated email notifications.

![AI Santa](https://img.shields.io/badge/Secret%20Santa-AI%20Powered-red?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-14+-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge)

## ✨ Features

- 🎁 **Automated Assignment Generation** - Randomly assigns Secret Santa pairs
- 📧 **Email Notifications** - Automatically sends assignment emails to participants
- 👥 **Player Management** - Easy to add, view, and remove participants
- 🔐 **Secure Login** - NameCode and email-based authentication
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 🔄 **Reset & Regenerate** - Admin can reset and regenerate assignments anytime

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Gmail account for sending emails

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AISanta
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure email settings**
   
   Create a `.env` file in the root directory:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PORT=5000
   NODE_ENV=development
   ```
   
   See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed Gmail setup instructions.

4. **Start the application**
   
   In one terminal:
   ```bash
   npm start
   ```
   
   In another terminal:
   ```bash
   cd client
   npm start
   ```

5. **Access the app**
   - Open http://localhost:3000
   - Login with admin credentials: `admin@gmail.com`
   - Add players and generate assignments!

## 📖 Usage

### For Admins

1. **Login** with `admin@gmail.com`
2. **Add Players** - Go to NameCodes and add participants with their names and emails
3. **Generate Assignments** - Click "Generate Assignments" to create Secret Santa pairs
4. **Email Notifications** - All participants receive their assignments via email
5. **Reset** - You can reset and regenerate assignments anytime

### For Players

1. **Login** with your NameCode and email
2. **View Assignment** - See who you're the Secret Santa for
3. **Keep it Secret!** 🤫

## 🌐 Deployment

See the comprehensive [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on:

- Setting up email notifications
- Deploying to Render (Free)
- Deploying to Railway
- Deploying to Azure
- Deploying to Heroku

**Quick Deploy to Render:**

1. Push your code to GitHub
2. Sign up at https://render.com
3. Create a new Web Service
4. Connect your GitHub repo
5. Add environment variables
6. Deploy!

Your app will be live at: `https://your-app-name.onrender.com`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_USER` | Gmail address for sending emails | Yes |
| `EMAIL_PASS` | Gmail app password (16 characters) | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Gmail Setup

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in your `.env` file

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
AISanta/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # API utilities
│   │   └── App.js         # Main app component
│   └── public/
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Data models (JSON files)
│   ├── emailService.js   # Email functionality
│   └── app.js            # Express server
├── .env.example          # Environment variables template
├── package.json          # Root dependencies
├── README.md             # This file
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- CSS3 with modern gradients and animations

### Backend
- Node.js
- Express
- Nodemailer (for email)
- JSON-based data storage

## 🐛 Troubleshooting

### Email Not Sending

- Verify Gmail app password is correct
- Ensure 2-factor authentication is enabled
- Check server logs for error messages
- Test with a simple email first

### App Not Loading

- Check if both server and client are running
- Verify API URLs are correct
- Check browser console for errors
- Ensure dependencies are installed

### Deployment Issues

- Verify environment variables are set
- Check build logs for errors
- Ensure Node.js version is compatible
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Review the troubleshooting section
3. Check server and browser console logs

## 🎄 Happy Secret Santa! 🎅

Made with ❤️ for spreading holiday cheer!
