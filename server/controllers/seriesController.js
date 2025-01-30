// server/controllers/seriesController.js
const Series = require('../models/Series');

// Create a new series (admin)
exports.createSeries = async (req, res) => {
  try {
    const { teamA, teamB, betOptions, startDate } = req.body;

    const newSeries = await Series.create({
      teamA,
      teamB,
      betOptions,
      startDate,
    });

    return res.status(201).json(newSeries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Update an existing series (admin)
exports.updateSeries = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { teamA, teamB, betOptions, startDate } = req.body;

    const updated = await Series.findByIdAndUpdate(
      seriesId,
      { teamA, teamB, betOptions, startDate },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: 'Series not found' });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Lock/Unlock a series (admin)
exports.lockSeries = async (req, res) => {
  try {
    const { seriesId } = req.params;
    // If you want to toggle lock/unlock, use the request body or a param
    const { isLocked } = req.body; // e.g. { isLocked: true }

    const series = await Series.findByIdAndUpdate(
      seriesId,
      { isLocked },
      { new: true }
    );

    if (!series) return res.status(404).json({ msg: 'Series not found' });
    return res.json(series);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get all series (public)
exports.getAllSeries = async (req, res) => {
  try {
    const seriesList = await Series.find({});
    return res.json(seriesList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get single series by ID (public)
exports.getSeriesById = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const series = await Series.findById(seriesId);
    if (!series) return res.status(404).json({ msg: 'Series not found' });
    return res.json(series);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
