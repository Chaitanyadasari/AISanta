const nodemailer = require('nodemailer');

// Check if environment variables are set, otherwise use placeholder values
const emailUser = process.env.EMAIL_USER || 'your_gmail@gmail.com';
const emailPass = process.env.EMAIL_PASS || 'your_gmail_app_password';

console.log('Email Service Initialized:');
console.log('  Email User:', emailUser);
console.log('  Email Pass:', emailPass ? '****' + emailPass.slice(-4) : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

function sendAssignmentEmail(to, assignedNameCode) {
  console.log(`Attempting to send email to: ${to} for assignment: ${assignedNameCode}`);
  return transporter.sendMail({
    from: `AI Santa <${emailUser}>`,
    to,
    subject: 'Your AI Santa Assignment! 🎅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #667eea; text-align: center; margin-bottom: 20px;">🎅 Secret Santa Assignment</h1>
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello!</p>
          <p style="font-size: 16px; color: #555; margin-bottom: 30px;">Your Secret Santa assignment has been generated!</p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="color: white; font-size: 18px; margin-bottom: 10px;">You are the Secret Santa for:</p>
            <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${assignedNameCode}</p>
          </div>
          <p style="font-size: 16px; color: #555; margin-top: 30px; text-align: center;">🤫 Keep it a secret and happy gifting! 🎁</p>
        </div>
      </div>
    `,
    text: `You are the Secret Santa for: ${assignedNameCode}\n\nKeep it a secret and happy gifting! 🎁`
  });
}

module.exports = { sendAssignmentEmail };
