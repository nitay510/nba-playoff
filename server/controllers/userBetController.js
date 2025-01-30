// server/controllers/userBetController.js
const UserBet = require('../models/UserBet');
const Series = require('../models/Series');

exports.placeOrUpdateBet = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { bets } = req.body;
    
    // userId comes from the middleware now
    const userId = req.user._id;

    // 1. Check if series is locked
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ msg: 'Series not found' });
    }
    if (series.isLocked) {
      return res.status(400).json({ msg: 'Series is locked - no changes allowed' });
    }

    // 2. Find or create a UserBet doc
    let userBet = await UserBet.findOne({ userId, seriesId });
    if (!userBet) {
      userBet = new UserBet({ userId, seriesId, bets });
      await userBet.save();
    } else {
      userBet.bets = bets;
      userBet.updatedAt = Date.now();
      await userBet.save();
    }

    return res.json(userBet);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUserBets = async (req, res) => {
  try {
    const userId = req.user._id;
    const userBets = await UserBet.find({ userId }).populate('seriesId');
    return res.json(userBets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUserBetForSeries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { seriesId } = req.params;

    const userBet = await UserBet.findOne({ userId, seriesId }).populate('seriesId');
    if (!userBet) return res.json({ bets: [] });
    return res.json(userBet);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
