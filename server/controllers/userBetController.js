// server/controllers/userBetController.js
const UserBet = require('../models/UserBet');
const Series = require('../models/Series');
const User = require('../models/User');

exports.placeOrUpdateBet = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { bets } = req.body;
    const userId = req.user._id;

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ msg: 'Series not found' });
    }
    if (series.isLocked) {
      return res.status(400).json({ msg: 'Series is locked - no changes allowed' });
    }

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
    // Sort newest to oldest by _id descending
    const userBets = await UserBet.find({ userId })
      .sort({ _id: -1 })
      .populate('seriesId');
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

exports.getAllUserBets = async (req, res) => {
  try {
    const userId = req.user._id;
    // Return bets in descending order by _id
    const bets = await UserBet.find({ userId })
      .sort({ _id: -1 })
      .populate('seriesId');
    return res.json(bets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllBetsOfAnyUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Fetch user bets and sort from newest to oldest
    const bets = await UserBet.find({ userId: user._id })
      .sort({ _id: -1 })
      .populate('seriesId');

    // Return both bets and champions field
    return res.json({
      champions: user.champions, // Ensure this field exists in the User model
      bets,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
