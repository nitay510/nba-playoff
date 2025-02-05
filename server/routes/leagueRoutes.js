const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const { requireAuth } = require('../middleware/authMiddleware');

// GET all leagues that the current user is in
router.get('/mine', requireAuth, leagueController.getMyLeagues);

// POST create a new league
router.post('/create', requireAuth, leagueController.createLeague);

// POST join a league by code
router.post('/join', requireAuth, leagueController.joinLeague);

router.get('/:leagueId/leaderboard', requireAuth, leagueController.getLeagueLeaderboard);

module.exports = router;
