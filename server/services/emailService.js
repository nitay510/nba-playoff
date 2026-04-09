const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');

  console.log('[Email] Creating transporter:', {
    host,
    port,
    user: user ? `${user.slice(0, 4)}***` : 'NOT SET',
    passSet: !!pass,
    passLen: pass ? pass.length : 0,
  });

  if (!user || !pass) {
    throw new Error(`Email env vars missing — EMAIL_USER=${user ? 'set' : 'MISSING'}, EMAIL_APP_PASSWORD=${pass ? 'set' : 'MISSING'}`);
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // avoid cert issues on some hosts
  });
}

async function sendPasswordResetEmail(toEmail, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink   = `${frontendUrl}/reset-password?token=${token}`;

  console.log('[Email] Sending reset email to:', toEmail);
  console.log('[Email] Reset link:', resetLink);

  const transporter = createTransporter();

  // Verify SMTP connection before sending
  try {
    await transporter.verify();
    console.log('[Email] SMTP connection verified OK');
  } catch (verifyErr) {
    console.error('[Email] SMTP verify FAILED:', verifyErr.message);
    throw verifyErr;
  }

  const info = await transporter.sendMail({
    from:    `"NBA Playoff Bets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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
        <p style="color:#999;font-size:0.75rem;">קישור ישיר: ${resetLink}</p>
      </div>
    `,
  });

  console.log('[Email] Sent successfully, messageId:', info.messageId);
}

module.exports = { sendPasswordResetEmail };
