const fs = require('fs');
const path = require('path');
const PLAYERS_FILE = path.join(__dirname, '../models/players.json');
const ASSIGN_FILE = path.join(__dirname, '../models/assignments.json');
const { sendAssignmentEmail } = require('../emailService');

function getPlayers() {
  const data = fs.readFileSync(PLAYERS_FILE, 'utf-8');
  return JSON.parse(data).players.filter(p => !p.isAdmin);
}

function readAssignments() {
  return JSON.parse(fs.readFileSync(ASSIGN_FILE, 'utf8')).assignments;
}
function writeAssignments(assignments) {
  fs.writeFileSync(ASSIGN_FILE, JSON.stringify({ assignments }, null, 2));
}

exports.getAssignment = async (req, res) => {
  const { nameCode } = req.body;
  if (!nameCode) return res.status(400).json({ success: false, message: 'Missing NameCode' });
  const assignments = readAssignments();
  let assignment = assignments.find(a => a.santa === nameCode);
  if (assignment) {
    return res.json({ success: true, recipient: assignment.recipient });
  }
  // No assignment exists yet - return success: false to indicate waiting
  return res.json({ success: false, message: 'No assignment yet. Please wait for admin to generate assignments.' });
};

exports.generateAssignments = async (req, res) => {
  const { nameCode } = req.body;
  // Only allow admin
  if (!nameCode || nameCode.toLowerCase() !== 'admin') {
    return res.status(401).json({ success: false, message: 'Only admin can generate assignments' });
  }
  const players = getPlayers();
  if (players.length < 2) {
    return res.status(400).json({ success: false, message: 'Not enough players for assignments' });
  }
  // Only non-admins - always reshuffle everyone
  const santas = players.filter(p => !p.isAdmin);
  let recipients = [...santas.map(p => p.nameCode)];
  let assignments = [];
  
  // Shuffle helper function
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  
  // Keep trying until we get a valid assignment (no self-assignments)
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    assignments = [];
    recipients = [...santas.map(p => p.nameCode)];
    shuffle(recipients);
    
    let valid = true;
    for (let i = 0; i < santas.length; i++) {
      let santa = santas[i].nameCode;
      let options = recipients.filter(r => r !== santa);
      
      if (options.length === 0) {
        valid = false;
        break;
      }
      
      let recipient = options[0];
      assignments.push({ santa, recipient });
      recipients = recipients.filter(r => r !== recipient);
    }
    
    if (valid) break;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    return res.status(500).json({ success: false, message: 'Assignment failed. Please try again.' });
  }
  
  // Clear old assignments and write new ones (reshuffle everyone)
  writeAssignments(assignments);
  
  // Send emails to all players
  for (const a of assignments) {
    const santaPlayer = santas.find(p => p.nameCode === a.santa);
    if (santaPlayer && santaPlayer.email) {
      try { 
        await sendAssignmentEmail(santaPlayer.email, a.recipient); 
      } catch (err) {
        // Log error but continue
      }
    }
  }
  
  res.json({ success: true, message: 'Assignments generated and emailed', assignments });
};