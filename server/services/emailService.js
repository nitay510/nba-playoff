async function sendPasswordResetEmail(toEmail, token) {
  const apiKey  = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey)    throw new Error('BREVO_API_KEY env var not set');
  if (!fromEmail) throw new Error('EMAIL_FROM env var not set');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink   = `${frontendUrl}/reset-password?token=${token}`;

  console.log('[Email] Sending reset email via Brevo to:', toEmail);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: {
      'api-key':      apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { name: 'NBA Playoff Bets', email: fromEmail },
      to:          [{ email: toEmail }],
      subject:     'איפוס סיסמה – NBA Playoff Bets',
      htmlContent: `
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
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[Email] Brevo error:', JSON.stringify(data));
    throw new Error(data.message || JSON.stringify(data));
  }

  console.log('[Email] Sent successfully, messageId:', data.messageId);
}

module.exports = { sendPasswordResetEmail };
