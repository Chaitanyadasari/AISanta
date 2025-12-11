# 🎅 AISanta - Secret Santa Web Application

A full-stack web application for managing Secret Santa assignments for remote teams and friend groups. The app allows users to register, login, and receive randomly assigned Secret Santa recipients via email.

**Developed by Chaitanya Dasari**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Application Flow](#application-flow)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Game Logic](#game-logic)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

AISanta solves the challenge of conducting Secret Santa gift exchanges for remote teams. Instead of drawing names from a physical bowl, participants can register online, and the system randomly assigns each person a gift recipient while ensuring no one is assigned to themselves.

### Problem Statement

Remote teams need a way to conduct Secret Santa games without being physically present to draw names from a bowl. Each player needs to be secretly assigned another player to gift, and this assignment should remain consistent across multiple logins.

### Solution

A web-based Secret Santa management system where:
- Admin can register players with their names and email addresses
- Players login with their unique name and email
- Admin generates random assignments ensuring no one gifts themselves
- Each player sees only their assigned recipient
- Assignments are emailed to participants and persist across sessions

---

## ✨ Features

### For Admin
-  Add new players with name and email
-  View all registered players
-  Generate random Secret Santa assignments for all players
-  Reset all assignments and start fresh
-  Automatic email notifications to all participants
-  Admin access with special login (`admin@gmail.com`)

### For Players
-  Secure login with name and email validation
-  View assigned Secret Santa recipient
-  Persistent assignments across sessions (localStorage)
-  Email notification when assignments are generated
-  "Wait and Watch" status when assignments are pending
-   View list of all players in the game

### System Features
-  No self-assignments (players never gift themselves)
-  Session persistence using localStorage
-  Real-time assignment updates
-  Email notifications via Nodemailer
-  Data persistence using JSON file storage
-  Responsive UI with modern CSS

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.1** - UI framework
- **CSS3** - Styling with gradients and animations
- **Fetch API** - HTTP requests to backend

### Backend
- **Node.js** - Runtime environment
- **Express 5.2.1** - Web framework
- **CORS** - Cross-origin resource sharing
- **Body-Parser** - Request body parsing
- **Nodemailer 7.0.11** - Email service

### Storage
- **JSON Files** - File-based database
  - `players.json` - Player data
  - `assignments.json` - Secret Santa assignments

---

## 📁 Project Structure

```
AISanta/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js             # Login page with name & email
│   │   │   ├── Landing.js           # Welcome page with admin controls
│   │   │   ├── NameCodes.js         # Player list & add player form
│   │   │   ├── AssignmentDisplay.js # Shows assigned recipient
│   │   │   └── Navigation.js        # Navigation bar
│   │   ├── utils/
│   │   │   └── api.js               # API helper functions
│   │   ├── App.js                   # Main application component
│   │   ├── App.css                  # Application styles
│   │   └── index.js                 # React entry point
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── controllers/
│   │   ├── authController.js        # Login authentication
│   │   ├── gameController.js        # Assignment generation logic
│   │   └── playerController.js      # Player management
│   ├── models/
│   │   ├── players.json             # Player data storage
│   │   └── assignments.json         # Assignment data storage
│   ├── app.js                       # Express server setup
│   └── emailService.js              # Email notification service
│
├── package.json                     # Root dependencies
└── README.md                        # This file
```

---

## 📦 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Gmail account** with App Password (for email notifications)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AISanta
```

### 2. Install Dependencies

#### Install server dependencies:
```bash
npm install
```

#### Install client dependencies:
```bash
cd client
npm install
cd ..
```

### 3. Initialize Data Files

Create the JSON data files in `server/models/`:

**server/models/players.json:**
```json
{
  "players": [
    {
      "nameCode": "Admin",
      "email": "",
      "isAdmin": true
    }
  ]
}
```

**server/models/assignments.json:**
```json
{
  "assignments": []
}
```

---

## ⚙️ Configuration

### Email Service Setup

Update [server/emailService.js](server/emailService.js) with your Gmail credentials:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',        // Your Gmail address
    pass: 'your_gmail_app_password'      // Gmail App Password
  }
});
```

**How to get Gmail App Password:**
1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password in the configuration

### API URL Configuration

The client connects to the backend at `http://localhost:5000`. If you change the server port, update [client/src/utils/api.js](client/src/utils/api.js):

```javascript
export const API_URL = 'http://localhost:5000/api';
```

---

## 🏃 Running the Application

### Start the Backend Server

```bash
# From project root
node server/app.js
```

Server will start on **http://localhost:5000**

### Start the Frontend Development Server

```bash
# From project root
cd client
npm start
```

Client will start on **http://localhost:3000**

### Access the Application

Open your browser and navigate to **http://localhost:3000**

---

## 🔄 Application Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                               │
│  • Admin logs in with: "Admin" + "admin@gmail.com"              │
│  • Players log in with: "<PlayerName>" + "<RegisteredEmail>"    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION                              │
│  • Verify nameCode exists in players.json                       │
│  • For Admin: email must be "admin@gmail.com"                   │
│  • For Players: email must match registered email               │
│  • Store session in localStorage                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
              [ADMIN]               [PLAYER]
                    │                   │
                    ↓                   ↓
    ┌───────────────────────┐    ┌───────────────────────┐
    │   ADMIN LANDING       │    │   PLAYER LANDING      │
    │  • Generate button    │    │  • Shows "Wait and    │
    │  • Reset button       │    │    Watch" if no       │
    │  • NameCodes tab      │    │    assignment         │
    │  • Logout button      │    │  • Shows assigned     │
    └───────────────────────┘    │    recipient when     │
                │                 │    generated          │
                │                 │  • NameCodes tab      │
                ↓                 │  • Logout button      │
    ┌───────────────────────┐    └───────────────────────┘
    │   NAMECODES PAGE      │               │
    │  • View all players   │               │
    │  • Add new players    │               ↓
    │  • Input: Name +Email │    ┌───────────────────────┐
    └───────────────────────┘    │   NAMECODES PAGE      │
                │                 │  • View all players   │
                ↓                 │  • (Read-only)        │
    ┌───────────────────────┐    └───────────────────────┘
    │  GENERATE ASSIGNMENTS │
    │  • Random assignment  │
    │  • No self-assignment │
    │  • Email to all       │
    │  • Save to JSON       │
    └───────────────────────┘
                │
                ↓
    ┌───────────────────────┐
    │  ALL PLAYERS NOTIFIED │
    │  • Email sent         │
    │  • Assignments stored │
    │  • Players can login  │
    │    and see recipient  │
    └───────────────────────┘
```

### Detailed Flow Steps

#### 1. **Admin Setup**
1. Admin logs in with credentials: `Admin` / `admin@gmail.com`
2. Navigates to "NameCodes" tab
3. Adds players with their names and email addresses
4. Each player is saved to `players.json`

#### 2. **Assignment Generation**
1. Admin clicks "Generate Assignments" button
2. Backend algorithm:
   - Retrieves all non-admin players
   - Creates random shuffle of recipients
   - Ensures no player is assigned to themselves
   - Stores assignments in `assignments.json`
   - Sends email to each player with their recipient
3. Success message displayed to admin

#### 3. **Player Experience**
1. Player logs in with their registered name and email
2. Backend validates credentials against `players.json`
3. If assignment exists:
   - Player sees assigned recipient name
4. If no assignment yet:
   - Player sees "Wait and Watch" message
5. Assignment persists across sessions via localStorage

#### 4. **Session Persistence**
- User credentials stored in localStorage
- Page state (landing/namecodes) preserved
- Assignment cached locally
- On page refresh: session restored automatically
- On logout: all localStorage data cleared

---

## 🔌 API Endpoints

### Authentication

#### POST `/api/login`
Authenticates users (admin or player).


### Player Management

#### GET `/api/namecodes`
Retrieves all player names (excluding admin).


#### POST `/api/namecodes`
Adds a new player (admin only).

### Assignment Management

#### POST `/api/getAssignment`
Retrieves assignment for a specific player.

#### POST `/api/generate-assignments`
Generates random assignments for all players (admin only).

#### POST `/api/reset-assignments`
Clears all assignments (admin only).


## 👥 User Roles

### Admin
- **Login:** `Admin` / `admin@gmail.com`
- **Permissions:**
  - Add/view all players
  - Generate Secret Santa assignments
  - Reset all assignments
- **Landing Page:** Shows admin controls (Generate & Reset buttons)
- **NameCodes Page:** Can add new players

### Player
- **Login:** `<RegisteredName>` / `<RegisteredEmail>`
- **Permissions:**
  - View assigned recipient
  - View list of all players
- **Landing Page:** Shows assigned recipient or "Wait and Watch"
- **NameCodes Page:** Read-only view

---

## 🎲 Game Logic

### Assignment Algorithm

1. **Retrieve Players:** Get all non-admin players from `players.json`
2. **Shuffle Recipients:** Create randomized list of potential recipients
3. **Assign Pairs:** For each player:
   - Select recipient from available options
   - Ensure recipient ≠ player (no self-assignment)
   - Remove recipient from available pool
4. **Retry Logic:** If valid assignment impossible, reshuffle and retry (max 100 attempts)
5. **Persist:** Save assignments to `assignments.json`
6. **Notify:** Send email to each player with their recipient

### Key Rules
-  No player can be assigned to themselves
-  Each player receives exactly one recipient
-  Each player is a recipient for exactly one other player
-  Assignments remain constant until admin resets
-  Minimum 2 players required for assignment generation

### Email Notification

Each player receives an email:
```
From: AI_Santa <your_gmail@gmail.com>
To: player@email.com
Subject: Your AI_Santa Assignment!

You are the Secret Santa for: <RecipientName>
Keep it a secret and happy gifting!
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Server not starting**
- **Error:** `Error: Cannot find module 'express'`
- **Solution:** Run `npm install` in project root

#### 2. **Client not starting**
- **Error:** `Module not found: Can't resolve 'react'`
- **Solution:** Run `npm install` inside `client/` directory

#### 3. **Email not sending**
- **Error:** `Invalid login: 534-5.7.9 Application-specific password required`
- **Solution:** 
  - Enable 2-Step Verification on Google Account
  - Generate App Password
  - Update `emailService.js` with App Password

#### 4. **CORS errors**
- **Error:** `Access to fetch blocked by CORS policy`
- **Solution:** Ensure backend server is running on port 5000

#### 5. **Login fails for admin**
- **Error:** `Invalid admin email/password`
- **Solution:** Use exact credentials: `Admin` / `admin@gmail.com`

#### 6. **Player can't login**
- **Error:** `Player Name not found`
- **Solution:** Admin must add player in NameCodes page first

#### 7. **Assignments not showing**
- **Error:** Player sees "Wait and Watch"
- **Solution:** Admin must click "Generate Assignments" button

#### 8. **Data lost on server restart**
- **Issue:** Players or assignments disappear
- **Solution:** Data is stored in JSON files and persists. Check `server/models/` directory exists and has correct permissions.

---

## 📝 Additional Notes

### Security Considerations
- This is a **prototype application** for internal use
- In production, implement:
  - Proper authentication with JWT tokens
  - Password hashing
  - Database (MongoDB/PostgreSQL) instead of JSON files
  - Environment variables for sensitive data
  - HTTPS for secure communication

### Future Enhancements
- Password-based authentication
- Player self-registration
- Gift wishlist feature
- Budget limits
- Assignment history
- Mobile-responsive design improvements
- Dark mode theme
- Export assignments to CSV

---

## 📄 License

All rights reserved. Developed by **Chaitanya Dasari**.

---

## 🎄 Happy Secret Santa!

Enjoy your remote Secret Santa gift exchange with AISanta! 🎅🎁 

