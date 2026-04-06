// server/controllers/syncController.js
// Admin-triggered sync: pulls NBA playoff bracket from ESPN and odds from FanDuel.
const Series   = require('../models/Series');
const { getPlayoffSeries }      = require('../services/espnService');
const { getSeriesOdds, getChampionshipOdds } = require('../services/oddsService');

const DEFAULT_GAMES_ODDS = [
  { name: '4', odds: 5.5 },
  { name: '5', odds: 3.0 },
  { name: '6', odds: 2.5 },
  { name: '7', odds: 2.8 },
];

/**
 * POST /api/sync/run  (admin only)
 * 1. Fetch current playoff bracket from ESPN.
 * 2. For each series:
 *    – Create it in DB if new, with FanDuel odds for "מנצחת הסדרה".
 *    – Update win counts on existing series.
 *    – Auto-lock if series has started.
 */
exports.syncFromNBA = async (req, res) => {
  try {
    const espnSeries = await getPlayoffSeries();
    const results = { created: 0, updated: 0, errors: 0 };

    for (const s of espnSeries) {
      try {
        // Try to find by ESPN uid first, then by team names
        let existing = s.externalId
          ? await Series.findOne({ externalId: s.externalId })
          : null;

        if (!existing) {
          existing = await Series.findOne({
            $or: [
              { teamA: s.teamAHe, teamB: s.teamBHe },
              { teamA: s.teamBHe, teamB: s.teamAHe },
            ],
          });
        }

        if (existing) {
          existing.externalId = s.externalId;
          existing.teamAWins  = s.teamAWins;
          existing.teamBWins  = s.teamBWins;
          if (s.startDate && !existing.startDate) existing.startDate = s.startDate;
          if (s.round && !existing.round) existing.round = s.round;

          // Auto-lock once series has started
          if (s.startDate && new Date() >= new Date(s.startDate)) {
            existing.isLocked = true;
          }

          await existing.save();
          results.updated++;
        } else {
          // Fetch FanDuel odds for this matchup
          const { teamAOdds, teamBOdds } = await getSeriesOdds(s.teamAEn, s.teamBEn);

          await Series.create({
            teamA:      s.teamAHe,
            teamB:      s.teamBHe,
            externalId: s.externalId,
            teamAWins:  s.teamAWins,
            teamBWins:  s.teamBWins,
            round:      s.round,
            startDate:  s.startDate,
            isLocked:   s.startDate ? new Date() >= new Date(s.startDate) : false,
            betOptions: [
              {
                category: 'מנצחת הסדרה',
                choices: [
                  { name: s.teamAHe, odds: teamAOdds },
                  { name: s.teamBHe, odds: teamBOdds },
                ],
              },
              {
                category: 'בכמה משחקים',
                choices: DEFAULT_GAMES_ODDS,
              },
            ],
          });
          results.created++;
        }
      } catch (err) {
        console.error(`[Sync] Error for ${s.teamAEn} vs ${s.teamBEn}:`, err.message);
        results.errors++;
      }
    }

    return res.json({
      msg: 'Sync complete',
      totalFromESPN: espnSeries.length,
      ...results,
    });
  } catch (err) {
    console.error('[Sync] Fatal error:', err);
    return res.status(500).json({ msg: 'Sync failed', error: err.message });
  }
};

/**
 * GET /api/sync/champion-odds  (public)
 * Returns FanDuel championship winner odds scaled to 1.5–10.
 * Used by ChampionSelectionPage to show real-time odds.
 */
exports.getChampionOdds = async (req, res) => {
  try {
    const odds = await getChampionshipOdds();
    return res.json(odds);
  } catch (err) {
    console.error('[Sync] Champion odds error:', err);
    return res.status(500).json({ msg: 'Failed to fetch champion odds' });
  }
};
