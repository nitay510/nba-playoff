const webpush = require('web-push');
const User     = require('../models/User');

/* ── VAPID setup ────────────────────────────────────────────────
 * Keys are generated once and stored in .env.
 * On first run (no keys set) we auto-generate and log them —
 * copy the output lines into your .env file then restart.
 * ─────────────────────────────────────────────────────────────*/
function initVapid() {
  let pub  = process.env.VAPID_PUBLIC_KEY;
  let priv = process.env.VAPID_PRIVATE_KEY;

  if (!pub || !priv) {
    const keys = webpush.generateVAPIDKeys();
    pub  = keys.publicKey;
    priv = keys.privateKey;
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  VAPID keys generated — add these to your .env file  ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  VAPID_PUBLIC_KEY=${pub}`);
    console.log(`║  VAPID_PRIVATE_KEY=${priv}`);
    console.log('╚══════════════════════════════════════════════════════╝');
    // Use for this session (subscriptions will break on next restart
    // until you add the keys to .env)
    process.env.VAPID_PUBLIC_KEY  = pub;
    process.env.VAPID_PRIVATE_KEY = priv;
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'nba@nbaplayoff.app'}`,
    pub,
    priv,
  );
}

initVapid();

/* ── Send a single push notification ──────────────────────────
 * Returns 'gone' when the subscription has expired (410/404)
 * so the caller can clean it from the DB.
 * ─────────────────────────────────────────────────────────────*/
async function sendPush(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return 'ok';
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) return 'gone';
    console.error('[Push] sendNotification error:', err.message);
    return 'error';
  }
}

/* ── Send to all devices of one user ──────────────────────────*/
async function sendToUser(userId, payload) {
  const user = await User.findById(userId).select('pushSubscriptions');
  if (!user?.pushSubscriptions?.length) return;

  const goneEndpoints = [];
  for (const sub of user.pushSubscriptions) {
    const result = await sendPush(sub, payload);
    if (result === 'gone') goneEndpoints.push(sub.endpoint);
  }

  // Clean up expired subscriptions
  if (goneEndpoints.length) {
    await User.findByIdAndUpdate(userId, {
      $pull: { pushSubscriptions: { endpoint: { $in: goneEndpoints } } },
    });
  }
}

module.exports = { sendToUser };
