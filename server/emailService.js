const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Demo - you may need to adjust
  auth: {
    user: 'your_gmail@gmail.com', // Replace with real email
    pass: 'your_gmail_app_password' // Use app password or env var
  }
});

function sendAssignmentEmail(to, assignedNameCode) {
  return transporter.sendMail({
    from: 'AI_Santa <your_gmail@gmail.com>',
    to,
    subject: 'Your AI_Santa Assignment!',
    text: `You are the Secret Santa for: ${assignedNameCode}\nKeep it a secret and happy gifting!`
  });
}

module.exports = { sendAssignmentEmail };
