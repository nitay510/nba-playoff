// server/models/Series.js
const mongoose = require('mongoose');

/**
 * We'll store multiple "bet options" inside each series:
 * Example:
 *   [
 *     {
 *       category: "winner",  // who wins
 *       choices: [
 *         { name: "Lakers", odds: 2.5 },
 *         { name: "Warriors", odds: 1.8 }
 *       ],
 *     },
 *     {
 *       category: "games",
 *       choices: [
 *         { name: "4 games", odds: 5.0 },
 *         { name: "5 games", odds: 3.0 },
 *         ...
 *       ],
 *     },
 *     ...
 *   ]
 */
const BetOptionSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g. "winner", "games", "top-scorer"
  choices: [
    {
      name: String,  // e.g. "Lakers"
      odds: Number,  // e.g. 2.5
    },
  ],
});

const SeriesSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  isLocked: { type: Boolean, default: false }, // if locked, users can no longer edit bets
  betOptions: [BetOptionSchema],
  startDate: { type: Date }, // optional: when the series starts
  // etc.
});

module.exports = mongoose.model('Series', SeriesSchema);
