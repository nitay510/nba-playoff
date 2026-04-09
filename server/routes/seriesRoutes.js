// server/routes/seriesRoutes.js
const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Only admin can create or update a series
router.post('/', requireAdmin, seriesController.createSeries);
router.put('/:seriesId', requireAdmin, seriesController.updateSeries);
router.put('/:seriesId/lock', requireAdmin, seriesController.lockSeries);
router.put('/:seriesId/results', requireAdmin, seriesController.setFinalResults);
// Anyone can see the series
router.get('/',                    seriesController.getAllSeries);
router.get('/:seriesId',           seriesController.getSeriesById);
router.get('/:seriesId/stats',     seriesController.getSeriesStats);
router.post('/:seriesId/refresh-stats', seriesController.refreshSeriesStats);

module.exports = router;
