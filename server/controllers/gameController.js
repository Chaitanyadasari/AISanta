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
  const players = getPlayers();
  const user = players.find(p => p.nameCode === nameCode);
  const allNames = players.map(p => p.nameCode);
  const taken = assignments.map(a => a.recipient);
  const available = allNames.filter(n => n !== nameCode && !taken.includes(n));
  if (available.length === 0) {
    return res.status(400).json({ success: false, message: 'No available assignment' });
  }
  const recipient = available[Math.floor(Math.random() * available.length)];
  assignments.push({ santa: nameCode, recipient });
  writeAssignments(assignments);
  // Send email only for new assignments
  if (user && user.email) {
    try {
      await sendAssignmentEmail(user.email, recipient);
    } catch (err) {
      // Could add logging here
    }
  }
  return res.json({ success: true, recipient });
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
  // Only non-admins
  const santas = players.filter(p => !p.isAdmin);
  let recipients = [...santas.map(p => p.nameCode)];
  let assignments = [];
  // shuffle helper
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
  shuffle(recipients);
  // Prevent self-assignment and duplicate recipients
  for (let i = 0; i < santas.length; ++i) {
    let santa = santas[i].nameCode;
    // Avoid self-assign
    let options = recipients.filter(r => r !== santa);
    if (options.length === 0) {
      // restart if stuck (rare for >2)
      return res.status(500).json({ success: false, message: 'Assignment failed. Please try again.' });
    }
    let recipient = options[0];
    assignments.push({ santa, recipient });
    recipients = recipients.filter(r => r !== recipient);
  }
  writeAssignments(assignments);
  // Send emails
  for (const a of assignments) {
    const santaPlayer = santas.find(p => p.nameCode === a.santa);
    if (santaPlayer && santaPlayer.email) {
      try { await sendAssignmentEmail(santaPlayer.email, a.recipient); } catch {}
    }
  }
  res.json({ success: true, message: 'Assignments generated and emailed', assignments });
};