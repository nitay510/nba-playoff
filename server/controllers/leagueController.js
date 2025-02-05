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
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
