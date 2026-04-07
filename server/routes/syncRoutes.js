const express  = require('express');
const router   = express.Router();
const syncCtrl = require('../controllers/syncController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.post('/run',            requireAdmin,  syncCtrl.syncFromNBA);
router.get ('/champion-odds',                 syncCtrl.getChampionOdds);
router.get ('/test',                          syncCtrl.testConnection);
router.get ('/teams',                         syncCtrl.getTeams);
router.get ('/series-data',    requireAdmin,  syncCtrl.getSeriesData);

module.exports = router;
