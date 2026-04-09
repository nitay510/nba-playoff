const { Resend } = require('resend');

async function sendPasswordResetEmail(toEmail, token) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY env var not set');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink   = `${frontendUrl}/reset-password?token=${token}`;

  console.log('[Email] Sending reset email via Resend to:', toEmail);

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from:    'NBA Playoff Bets <onboarding@resend.dev>',
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

  if (error) {
    console.error('[Email] Resend error:', JSON.stringify(error));
    throw new Error(error.message || JSON.stringify(error));
  }

  console.log('[Email] Sent successfully, id:', data?.id);
}

module.exports = { sendPasswordResetEmail };
