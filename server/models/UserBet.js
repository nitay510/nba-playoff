// server/models/UserBet.js
const mongoose = require('mongoose');

const UserBetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  bets: [
    {
      category: String,
      choiceName: String,
      oddsWhenPlaced: Number,
    },
  ],
  tiebreakerGuess: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserBet', UserBetSchema);
