const express    = require('express');
const router     = express.Router();
const syncCtrl   = require('../controllers/syncController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Admin triggers a full sync from ESPN + FanDuel
router.post('/run', requireAdmin, syncCtrl.syncFromNBA);

// Public: current FanDuel championship winner odds (for champion selection page)
router.get('/champion-odds', syncCtrl.getChampionOdds);

module.exports = router;
