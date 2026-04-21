const League = require('../models/League');
const User = require('../models/User');
const crypto = require('crypto'); // Replacing nanoid with crypto

// Function to generate a random code
const generateCode = (length) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// GET /api/leagues/mine
// Return all leagues where the user is a member
exports.getMyLeagues = async (req, res) => {
  try {
    const userId = req.user._id;
    const leagues = await League.find({ members: userId });
    return res.json(leagues);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/leagues/create
// Create a new league, generate a code, add creator to members
exports.createLeague = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body; // league name from front-end

    // Generate a random code (6 characters)
    const code = generateCode(6);

    // Create league
    const newLeague = await League.create({
      name,
      code,
      members: [userId],
    });

    return res.status(201).json(newLeague);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/leagues/join
// Join an existing league by code
exports.joinLeague = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body; // the code user enters

    // Find league by code
    const league = await League.findOne({ code });
    if (!league) {
      return res.status(404).json({ msg: 'League not found by that code' });
    }

    // If already a member, no need to rejoin
    if (league.members.includes(userId)) {
      return res.status(400).json({ msg: 'You are already in this league' });
    }

    // Add user to members
    league.members.push(userId);
    await league.save();

    return res.json(league);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/leagues/:leagueId/leaderboard
// Get leaderboard for a specific league
exports.getLeagueLeaderboard = async (req, res) => {
  try {
    const { leagueId } = req.params;

    // find league
    const league = await League.findById(leagueId).populate('members');
    if (!league) {
      return res.status(404).json({ msg: 'League not found' });
    }

    // Sort members by points in descending order
    const sortedMembers = league.members.sort((a, b) => b.points - a.points);

    // Build leaderboard
    const leaderboard = sortedMembers.map((u) => ({
      _id: u._id,
      username: u.username,
      points: u.points,
    }));

    res.json({
      leagueId: league._id,
      leagueName: league.name,
      leagueCode: league.code,
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/* ── GET /api/leagues/:leagueId/bets-breakdown ─────────────── */
exports.getBetsBreakdown = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const Series  = require('../models/Series');
    const UserBet = require('../models/UserBet');

    const league = await League.findById(leagueId).populate('members', '_id');
    if (!league) return res.status(404).json({ msg: 'League not found' });

    const memberIds = league.members.map((m) => m._id);

    // Only locked, unfinished series
    const activeSeries = await Series.find({ isLocked: true, isFinished: false });

    const result = [];
    for (const series of activeSeries) {
      const bets = await UserBet.find({
        seriesId: series._id,
        userId: { $in: memberIds },
      });

      const catMap = {};
      for (const ub of bets) {
        for (const b of ub.bets) {
          if (!catMap[b.category]) catMap[b.category] = {};
          catMap[b.category][b.choiceName] = (catMap[b.category][b.choiceName] || 0) + 1;
        }
      }

      const categories = Object.entries(catMap).map(([cat, choices]) => ({
        category: cat,
        totalVotes: Object.values(choices).reduce((s, v) => s + v, 0),
        choices: Object.entries(choices)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      }));

      result.push({
        seriesId: series._id,
        teamA:        series.teamA,
        teamB:        series.teamB,
        teamAWins:    series.teamAWins || 0,
        teamBWins:    series.teamBWins || 0,
        round:        series.round,
        totalMembers: memberIds.length,
        totalBettors: bets.length,
        categories,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error('[BetsBreakdown]', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMyRank = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const userId       = req.user._id;

    /* bring league members with points only */
    const league = await League.findById(leagueId)
      .populate({ path: 'members', select: 'points' });

    if (!league) return res.status(404).json({ msg: 'League not found' });

    /* sort members by points desc */
    const sorted = league.members
      .sort((a, b) => b.points - a.points)
      .map((u) => u._id.toString());

    const rank  = sorted.indexOf(userId.toString()) + 1; // 1‑based
    const total = sorted.length;

    /* if user not in league – return only total */
    return res.json({ rank: rank || null, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};