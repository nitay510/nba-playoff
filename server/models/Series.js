// server/models/Series.js
const mongoose = require('mongoose');
const BetOptionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  choices: [
    {
      name: String,  // e.g. "לייקרס"
      odds: Number,
    },
  ],
  finalChoice: { type: String, default: null },  // the name of the correct choice
});

const SeriesSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  isLocked: { type: Boolean, default: false },
  betOptions: [BetOptionSchema],
  startDate: { type: Date },
  isFinished: { type: Boolean, default: false },
  // Live sync fields (populated by the ESPN sync)
  externalId: { type: String },          // ESPN series UID for deduplication
  teamAWins:  { type: Number, default: 0 },
  teamBWins:  { type: Number, default: 0 },
  round:      { type: String },          // "First Round", "Conference Semifinals" …
});

module.exports = mongoose.model('Series', SeriesSchema);
