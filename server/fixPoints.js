/**
 * fixPoints.js — Recalculate every user's points from scratch.
 *
 * Logic (mirrors setFinalResults in seriesController.js):
 *   For every finished series, for each user bet on that series,
 *   for each bet in that bet doc: if category.finalChoice === bet.choiceName
 *   then add bet.oddsWhenPlaced to that user's total.
 *
 * Usage:
 *   node fixPoints.js           → dry run, prints before/after, writes nothing
 *   node fixPoints.js --apply   → applies the corrected points to MongoDB
 *
 * Requires MONGO_URI in environment (or a local .env file).
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not set.');
  process.exit(1);
}

const apply = process.argv.includes('--apply');

// ── Inline schemas (avoid importing the full app) ──────────────
const BetOptionSchema = new mongoose.Schema({
  category:    String,
  choices:     [{ name: String, odds: Number }],
  finalChoice: { type: String, default: null },
});
const SeriesSchema = new mongoose.Schema({
  teamA:      String,
  teamB:      String,
  isFinished: Boolean,
  betOptions: [BetOptionSchema],
});
const UserBetSchema = new mongoose.Schema({
  userId:   mongoose.Schema.Types.ObjectId,
  seriesId: mongoose.Schema.Types.ObjectId,
  bets: [{
    category:       String,
    choiceName:     String,
    oddsWhenPlaced: Number,
  }],
});
const UserSchema = new mongoose.Schema({
  username: String,
  points:   { type: Number, default: 0 },
});

const Series  = mongoose.model('Series',  SeriesSchema);
const UserBet = mongoose.model('UserBet', UserBetSchema);
const User    = mongoose.model('User',    UserSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.\n');

  // Load all finished series
  const finishedSeries = await Series.find({ isFinished: true });
  console.log(`Finished series: ${finishedSeries.length}`);

  // Build a map seriesId → series for quick lookup
  const seriesMap = {};
  for (const s of finishedSeries) {
    seriesMap[String(s._id)] = s;
  }

  // Load all user bets for finished series
  const finishedIds  = finishedSeries.map((s) => s._id);
  const allBets      = await UserBet.find({ seriesId: { $in: finishedIds } });

  // Aggregate correct points per userId
  const pointsMap = {}; // userId string → total correct points
  for (const ub of allBets) {
    const series = seriesMap[String(ub.seriesId)];
    if (!series) continue;

    let earned = 0;
    for (const b of ub.bets) {
      const cat = series.betOptions.find((o) => o.category === b.category);
      if (cat && cat.finalChoice && cat.finalChoice === b.choiceName) {
        earned += b.oddsWhenPlaced;
      }
    }

    if (earned > 0) {
      const uid = String(ub.userId);
      pointsMap[uid] = (pointsMap[uid] || 0) + earned;
    }
  }

  // Load all users
  const users = await User.find({});
  console.log(`Total users: ${users.length}\n`);

  let changedCount = 0;
  const changes = [];

  for (const user of users) {
    const uid           = String(user._id);
    const correctPoints = Math.round((pointsMap[uid] || 0) * 10) / 10;
    const currentPoints = user.points || 0;
    const roundedCurrent = Math.round(currentPoints * 10) / 10;

    // Update if value is wrong OR if the stored number has floating-point noise
    if (roundedCurrent !== correctPoints || currentPoints !== roundedCurrent) {
      changedCount++;
      changes.push({
        user,
        from: currentPoints,
        to:   correctPoints,
      });
    }
  }

  if (changes.length === 0) {
    console.log('All user points are already correct. Nothing to change.');
    await mongoose.disconnect();
    return;
  }

  // Print summary
  console.log(`Users that need correction: ${changedCount}\n`);
  console.log('Username'.padEnd(25) + 'Current'.padEnd(12) + 'Correct'.padEnd(12) + 'Diff');
  console.log('-'.repeat(60));
  for (const { user, from, to } of changes) {
    const diff = to - from;
    const sign = diff > 0 ? '+' : '';
    console.log(
      user.username.padEnd(25) +
      String(from).padEnd(12) +
      String(to).padEnd(12) +
      `${sign}${diff}`
    );
  }
  console.log();

  if (!apply) {
    console.log('Dry run — no changes written.');
    console.log('Run with --apply to save corrections to MongoDB.');
    await mongoose.disconnect();
    return;
  }

  // Apply corrections
  for (const { user, to } of changes) {
    user.points = Math.round(to * 10) / 10;
    await user.save();
  }

  console.log(`Done. Updated ${changedCount} user(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
