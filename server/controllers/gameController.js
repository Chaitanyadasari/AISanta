const playersDB = require('../db/playersDB');
const assignmentsDB = require('../db/assignmentsDB');
const { sendAssignmentEmail } = require('../emailService');

exports.getAssignment = async (req, res) => {
  try {
    const { nameCode } = req.body;
    if (!nameCode) {
      return res.status(400).json({ success: false, message: 'Missing NameCode' });
    }
    
    const { assignments } = await assignmentsDB.getAllAssignments();
    
    // Normalize for comparison (ignore spaces and case)
    const normalize = s => (s || '').replace(/\s+/g, '').toLowerCase();
    const assignment = assignments.find(a => normalize(a.santa) === normalize(nameCode));
    
    if (assignment) {
      return res.json({ success: true, recipient: assignment.recipient });
    }
    
    // No assignment exists yet
    return res.json({ 
      success: false, 
      message: 'No assignment yet. Please wait for admin to generate assignments.' 
    });
  } catch (error) {
    console.error('Error getting assignment:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving assignment' });
  }
};

exports.generateAssignments = async (req, res) => {
  try {
    const { nameCode } = req.body;
    
    // Only allow admin
    if (!nameCode || nameCode.toLowerCase() !== 'admin') {
      return res.status(401).json({ success: false, message: 'Only admin can generate assignments' });
    }
    
    const { players } = await playersDB.getAllPlayers();
    const santas = players.filter(p => !p.isAdmin);
    
    if (santas.length < 2) {
      return res.status(400).json({ success: false, message: 'Not enough players for assignments' });
    }
    
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
      return res.status(500).json({ 
        success: false, 
        message: 'Assignment failed. Please try again.' 
      });
    }
    
    // Save assignments to MongoDB
    await assignmentsDB.saveAssignments(assignments);
    
    // Send emails to all players
    for (const a of assignments) {
      const santaPlayer = santas.find(p => p.nameCode === a.santa);
      if (santaPlayer && santaPlayer.email) {
        try { 
          await sendAssignmentEmail(santaPlayer.email, a.recipient); 
        } catch (err) {
          console.error('Error sending email to', santaPlayer.email, ':', err);
          // Log error but continue
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Assignments generated and emailed', 
      assignments 
    });
  } catch (error) {
    console.error('Error generating assignments:', error);
    return res.status(500).json({ success: false, message: 'Error generating assignments' });
  }
};

exports.resetAssignments = async (req, res) => {
  try {
    const { nameCode } = req.body;
    
    // Only allow admin
    if (!nameCode || nameCode.toLowerCase() !== 'admin') {
      return res.status(401).json({ success: false, message: 'Only admin can reset assignments' });
    }
    
    // Clear all assignments
    await assignmentsDB.clearAssignments();
    
    res.json({ success: true, message: 'All assignments have been cleared' });
  } catch (error) {
    console.error('Error resetting assignments:', error);
    return res.status(500).json({ success: false, message: 'Error resetting assignments' });
  }
};