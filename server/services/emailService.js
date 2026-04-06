// server/services/emailService.js
// Sends transactional emails via SMTP (Gmail or any provider).
// Set EMAIL_USER, EMAIL_APP_PASSWORD, and optionally EMAIL_FROM in your .env
const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // TLS upgrade via STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Send a password-reset email.
 * @param {string} toEmail  Recipient email address
 * @param {string} token    The reset token (raw, not hashed)
 */
async function sendPasswordResetEmail(toEmail, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink   = `${frontendUrl}/reset-password?token=${token}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      toEmail,
    subject: 'איפוס סיסמה – NBA Playoff Bets',
    html: `
      <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1a1a2e;">איפוס סיסמה</h2>
        <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
        <p>לחץ על הכפתור הבא לאיפוס (בתוקף למשך שעה אחת):</p>
        <a href="${resetLink}"
           style="display:inline-block;background:#0d6efd;color:#fff;
                  padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;
                  font-weight:bold;margin:1rem 0;">
          אפס סיסמה
        </a>
        <p style="color:#666;font-size:0.85rem;">
          אם לא ביקשת איפוס סיסמה – התעלם מאימייל זה.
        </p>
        <p style="color:#999;font-size:0.75rem;">
          קישור ישיר: ${resetLink}
        </p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
