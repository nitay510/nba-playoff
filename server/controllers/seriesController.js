// server/controllers/seriesController.js
const Series = require('../models/Series');
const UserBet = require('../models/UserBet');
const User = require('../models/User');
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


exports.getAllSeries = async (req, res) => {
  try {
    // Fetch all series
    let seriesList = await Series.find({});
    
    // Check each series if startDate is in the past
    // If so, and not locked yet, lock it
    for (const series of seriesList) {
      if (!series.isLocked && series.startDate) {
        if (new Date() >= series.startDate) {
          series.isLocked = true;
          await series.save();
        }
      }
    }

    // Re-fetch or just return the updated array
    // If you want to ensure the newly locked statuses are included:
    seriesList = await Series.find({});
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

exports.setFinalResults = async (req, res) => {
    try {
      const { seriesId } = req.params;
      const { finalResults } = req.body;
      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ msg: 'Series not found' });
      }
  
      // update finalChoice in each category
      finalResults.forEach((fr) => {
        const opt = series.betOptions.find((o) => o.category === fr.category);
        if (opt) {
          opt.finalChoice = fr.finalChoice;
        }
      });
  
      series.isFinished = true;
      await series.save();
  
      // award points to users
      const userBets = await UserBet.find({ seriesId: series._id });
      for (let ub of userBets) {
        let totalPointsAwarded = 0;
        for (let b of ub.bets) {
          const cat = series.betOptions.find((o) => o.category === b.category);
          if (cat && cat.finalChoice === b.choiceName) {
            // user guessed correctly => add b.oddsWhenPlaced
            totalPointsAwarded += b.oddsWhenPlaced;
          }
        }
        if (totalPointsAwarded > 0) {
          const user = await User.findById(ub.userId);
          if (user) {
            user.points += totalPointsAwarded;
            await user.save();
          }
        }
      }
  
      return res.json({ msg: 'Final results set, points awarded' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Server error' });
    }
  };