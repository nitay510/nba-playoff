// server/routes/userBetRoutes.js
const express = require('express');
const router = express.Router();
const userBetController = require('../controllers/userBetController');
const { requireAuth } = require('../middleware/authMiddleware');

// To place/update bet, the user must be logged in
router.post('/:seriesId', requireAuth, userBetController.placeOrUpdateBet);
router.get('/', requireAuth, userBetController.getUserBets);
router.get('/all', requireAuth, userBetController.getAllUserBets);
router.get('/:seriesId', requireAuth, userBetController.getUserBetForSeries);
router.get('/user/:username', requireAuth, userBetController.getAllBetsOfAnyUser);
module.exports = router;
