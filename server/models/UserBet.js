// server/models/UserBet.js
const mongoose = require('mongoose');

const UserBetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  bets: [
    {
      category: String,       // e.g. "winner", "games", "top-scorer"
      choiceName: String,     // e.g. "Lakers", "LeBron James"
      oddsWhenPlaced: Number, // store the odds user locked in
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserBet', UserBetSchema);
