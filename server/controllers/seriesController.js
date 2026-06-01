// server/controllers/seriesController.js
const Series = require('../models/Series');
const UserBet = require('../models/UserBet');
const User = require('../models/User');
const { getSeriesGames, getSeriesPlayerStats } = require('../services/espnService');
const { NBA_TEAM_IDS } = require('../services/nbaTeamIds');
// Create a new series (admin)
exports.createSeries = async (req, res) => {
  try {
    const { teamA, teamB, betOptions, startDate, tiebreakerQuestion } = req.body;

    const newSeries = await Series.create({
      teamA,
      teamB,
      betOptions,
      startDate,
      tiebreakerQuestion: tiebreakerQuestion || null,
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
    const { teamA, teamB, betOptions, startDate, tiebreakerQuestion } = req.body;

    const updated = await Series.findByIdAndUpdate(
      seriesId,
      { teamA, teamB, betOptions, startDate, tiebreakerQuestion: tiebreakerQuestion || null },
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
      const { finalResults, tiebreakerAnswer } = req.body;
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

      if (tiebreakerAnswer !== undefined && tiebreakerAnswer !== null && tiebreakerAnswer !== '') {
        series.tiebreakerAnswer = Number(tiebreakerAnswer);
      }

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
/* ── GET /api/series/:seriesId/stats  (public) ─────────────── */
exports.getSeriesStats = async (req, res) => {
  try {
    const series = await Series.findById(req.params.seriesId);
    if (!series) return res.status(404).json({ msg: 'Not found' });

    // Use stored ESPN IDs, falling back to the name→ID map (same logic as refreshSeriesStats)
    const aId = series.teamAEspnId || String(NBA_TEAM_IDS[series.teamA] || '');
    const bId = series.teamBEspnId || String(NBA_TEAM_IDS[series.teamB] || '');

    // Persist IDs if they were missing
    if (aId && !series.teamAEspnId) { series.teamAEspnId = aId; }
    if (bId && !series.teamBEspnId) { series.teamBEspnId = bId; }

    const games = aId && bId ? await getSeriesGames(aId, bId) : [];

    // Compute wins from live game results (more up-to-date than hourly DB sync)
    let teamAWins = series.teamAWins || 0;
    let teamBWins = series.teamBWins || 0;

    if (aId && games.length > 0) {
      let computedA = 0;
      let computedB = 0;
      for (const g of games) {
        if (!g.isCompleted) continue;
        const homeIsA = g.homeTeamId === aId;
        if (homeIsA) {
          if (g.homeWon) computedA++;
          else if (g.awayWon) computedB++;
        } else {
          if (g.awayWon) computedA++;
          else if (g.homeWon) computedB++;
        }
      }
      // Use computed total if it's fresher than DB
      if (computedA + computedB > teamAWins + teamBWins) {
        teamAWins = computedA;
        teamBWins = computedB;
      }
    }

    // Save any updates (IDs, wins) back to DB so the home page reflects them
    if (series.teamAWins !== teamAWins || series.teamBWins !== teamBWins ||
        series.teamAEspnId !== aId     || series.teamBEspnId !== bId) {
      series.teamAWins   = teamAWins;
      series.teamBWins   = teamBWins;
      await series.save();
    }

    return res.json({
      _id:         series._id,
      teamA:       series.teamA,
      teamB:       series.teamB,
      teamAWins,
      teamBWins,
      round:       series.round,
      playerStats: series.playerStats || [],
      games,
    });
  } catch (err) {
    console.error('[SeriesStats]', err);
    return res.status(500).json({ msg: err.message });
  }
};

/* ── POST /api/series/:seriesId/refresh-stats  (public) ────── */
exports.refreshSeriesStats = async (req, res) => {
  try {
    const series = await Series.findById(req.params.seriesId);
    if (!series) return res.status(404).json({ msg: 'Not found' });

    const aId = series.teamAEspnId || String(NBA_TEAM_IDS[series.teamA] || '');
    const bId = series.teamBEspnId || String(NBA_TEAM_IDS[series.teamB] || '');
    if (!aId || !bId) return res.status(400).json({ msg: 'ESPN IDs missing for this series' });

    const [stats, games] = await Promise.all([
      getSeriesPlayerStats(aId, bId),
      getSeriesGames(aId, bId),
    ]);

    if (stats.length > 0) {
      series.playerStats = stats;
      await series.save();
    }

    return res.json({ playerStats: series.playerStats, games });
  } catch (err) {
    console.error('[RefreshStats]', err);
    return res.status(500).json({ msg: err.message });
  }
};
