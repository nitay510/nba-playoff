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
const { getPlayoffSeries, getSeriesPlayerStats } = require('./services/espnService');
const Series = require('./models/Series');
const { NBA_TEAM_IDS } = require('./services/nbaTeamIds');

/* ── Sync every hour: update win counts, lock status, and stats after games ── */
async function autoSync() {
  try {
    const espnSeries = await getPlayoffSeries();
    for (const s of espnSeries) {
      const filter = s.externalId
        ? { externalId: s.externalId }
        : { $or: [{ teamA: s.teamAHe, teamB: s.teamBHe }, { teamA: s.teamBHe, teamB: s.teamAHe }] };

      // Check current wins before updating, so we know if a game just finished
      const existing = await Series.findOne(filter);
      const prevTotal = existing ? (existing.teamAWins || 0) + (existing.teamBWins || 0) : 0;
      const newTotal  = (s.teamAWins || 0) + (s.teamBWins || 0);
      const gameFinished = newTotal > prevTotal;

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

      // Refresh player stats whenever a new game completed (or stats are empty)
      const noStats = !existing?.playerStats?.length;
      if (gameFinished || noStats) {
        const aId = s.teamAEspnId ? String(s.teamAEspnId) : String(NBA_TEAM_IDS[s.teamAHe] || '');
        const bId = s.teamBEspnId ? String(s.teamBEspnId) : String(NBA_TEAM_IDS[s.teamBHe] || '');
        if (aId && bId) {
          try {
            const stats = await getSeriesPlayerStats(aId, bId);
            if (stats.length > 0) {
              await Series.findOneAndUpdate(filter, { $set: { playerStats: stats } });
              console.log(`[AutoSync] Stats refreshed for ${s.teamAHe} vs ${s.teamBHe} (${stats.length} players)`);
            }
          } catch (err) {
            console.error(`[AutoSync] Stats error for ${s.teamAHe} vs ${s.teamBHe}:`, err.message);
          }
        }
      }
    }
    if (espnSeries.length) console.log(`[AutoSync] Updated ${espnSeries.length} series`);
  } catch (err) {
    console.error('[AutoSync] Error:', err.message);
  }
}

// Start schedulers after DB connects (give 10s), then run every hour
setTimeout(autoSync, 10_000);
setInterval(autoSync, 60 * 60 * 1000);

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
