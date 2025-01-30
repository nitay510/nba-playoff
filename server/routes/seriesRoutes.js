// server/routes/seriesRoutes.js
const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Only admin can create or update a series
router.post('/', requireAdmin, seriesController.createSeries);
router.put('/:seriesId', requireAdmin, seriesController.updateSeries);
router.put('/:seriesId/lock', requireAdmin, seriesController.lockSeries);

// Anyone can see the series
router.get('/', seriesController.getAllSeries);
router.get('/:seriesId', seriesController.getSeriesById);

module.exports = router;
