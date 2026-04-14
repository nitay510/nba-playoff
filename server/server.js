/***************************************************
 * server.js
 **************************************************/
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express      = require('express');
const cors         = require('cors');
const mongoose     = require('mongoose');
const cookieParser = require('cookie-parser');
const path         = require('path');

// Routes
const contactRoutes = require('./routes/contactRoutes');
const authRoutes    = require('./routes/authRoutes');
const seriesRoutes  = require('./routes/seriesRoutes');
const leagueRoutes  = require('./routes/leagueRoutes');
const userBetRoutes = require('./routes/userBetRoutes');
const syncRoutes    = require('./routes/syncRoutes');
const pushRoutes    = require('./routes/pushRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

/***************************************************
 * CORS
 * In production the React build is served from the
 * same origin, so the browser never cross-origins.
 * We still allow localhost:3000 for local dev.
 ***************************************************/
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://nba-playoff-eyd5.onrender.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/***************************************************
 * MongoDB
 ***************************************************/
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

/***************************************************
 * API Routes
 ***************************************************/
app.use('/api/auth',      authRoutes);
app.use('/api/contact',   contactRoutes);
app.use('/api/series',    seriesRoutes);
app.use('/api/user-bets', userBetRoutes);
app.use('/api/leagues',   leagueRoutes);
app.use('/api/sync',      syncRoutes);
app.use('/api/push',      pushRoutes);

/***************************************************
 * Serve React Build (production)
 ***************************************************/
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/***************************************************
 * Start Server
 ***************************************************/
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});

/***************************************************
 * Schedulers
 ***************************************************/
const { getPlayoffSeries } = require('./services/espnService');
const Series = require('./models/Series');
const { runDailyStatsSync } = require('./controllers/syncController');

/* ── Light sync every 4h: update win counts + lock status ── */
async function autoSync() {
  try {
    const espnSeries = await getPlayoffSeries();
    for (const s of espnSeries) {
      const filter = s.externalId
        ? { externalId: s.externalId }
        : { $or: [{ teamA: s.teamAHe, teamB: s.teamBHe }, { teamA: s.teamBHe, teamB: s.teamAHe }] };
      await Series.findOneAndUpdate(filter, {
        $set: {
          teamAWins:   s.teamAWins,
          teamBWins:   s.teamBWins,
          externalId:  s.externalId,
          ...(s.teamAEspnId ? { teamAEspnId: String(s.teamAEspnId) } : {}),
          ...(s.teamBEspnId ? { teamBEspnId: String(s.teamBEspnId) } : {}),
          ...(s.startDate && new Date() >= new Date(s.startDate) ? { isLocked: true } : {}),
        },
      });
    }
    if (espnSeries.length) console.log(`[AutoSync] Updated ${espnSeries.length} series`);
  } catch (err) {
    console.error('[AutoSync] Error:', err.message);
  }
}

/* ── Daily stats sync at 8:00 AM Israel time (UTC+3 = 05:00 UTC) ── */
function scheduleDailyAt5UTC(fn) {
  const now    = new Date();
  const next5  = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0, 0
  ));
  if (next5 <= now) next5.setUTCDate(next5.getUTCDate() + 1);
  const msUntil = next5 - now;
  console.log(`[DailySync] Next run in ${Math.round(msUntil / 60000)} minutes (05:00 UTC / 08:00 Israel)`);
  setTimeout(() => {
    fn();
    setInterval(fn, 24 * 60 * 60 * 1000);
  }, msUntil);
}

// Start schedulers after DB connects (give 10s)
setTimeout(autoSync, 10_000);
setInterval(autoSync, 4 * 60 * 60 * 1000);
scheduleDailyAt5UTC(runDailyStatsSync);

/* ── Pre-series push notifications ─────────────────────────────
 * Every 30 minutes: find series starting in ~2 hours and notify
 * every user who hasn't submitted their bets for that series yet.
 * ─────────────────────────────────────────────────────────────*/
const UserBet        = require('./models/UserBet');
const User           = require('./models/User');
const { sendToUser } = require('./services/pushService');

async function sendPreSeriesNotifications() {
  try {
    const now        = new Date();
    const windowFrom = new Date(now.getTime() + 1.5 * 60 * 60 * 1000); // now + 1h30m
    const windowTo   = new Date(now.getTime() + 2.5 * 60 * 60 * 1000); // now + 2h30m

    // Series starting within the 1h-window around the 2h mark
    const upcoming = await Series.find({
      startDate:  { $gte: windowFrom, $lte: windowTo },
      isLocked:   false,
      isFinished: false,
    });

    if (!upcoming.length) return;

    // All users who have at least one push subscription
    const usersWithPush = await User.find(
      { 'pushSubscriptions.0': { $exists: true } },
      '_id pushSubscriptions',
    );

    for (const series of upcoming) {
      // Users who already submitted bets for this series
      const existingBets = await UserBet.find(
        { seriesId: series._id },
        'userId',
      );
      const bettedUserIds = new Set(existingBets.map((b) => String(b.userId)));

      const minutesLeft = Math.round((new Date(series.startDate) - now) / 60000);

      for (const user of usersWithPush) {
        if (bettedUserIds.has(String(user._id))) continue; // already bet

        await sendToUser(user._id, {
          title: '⏰ אל תשכח למלא הימורים!',
          body:  `${series.teamA} נגד ${series.teamB} מתחיל בעוד ~${minutesLeft} דקות`,
          url:   '/home',
        });
      }
    }
  } catch (err) {
    console.error('[PushNotif] Error:', err.message);
  }
}

// Start after 15s, then every 30 minutes
setTimeout(sendPreSeriesNotifications, 15_000);
setInterval(sendPreSeriesNotifications, 30 * 60 * 1000);
