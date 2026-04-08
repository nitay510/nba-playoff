const Series   = require('../models/Series');
const { getPlayoffSeries, getTeamRoster, getSeriesPlayerStats, testESPN } = require('../services/espnService');
const { getSeriesOdds, getChampionshipOdds } = require('../services/oddsService');
const { NBA_TEAM_IDS, ALL_TEAMS } = require('../services/nbaTeamIds');

const DEFAULT_GAMES_ODDS = [
  { name: '4', odds: 5.5 },
  { name: '5', odds: 3.0 },
  { name: '6', odds: 2.5 },
  { name: '7', odds: 2.8 },
];

/* ── POST /api/sync/run  (admin) ──────────────────────────────
 * Pull playoff bracket from ESPN, create/update DB series.
 * ----------------------------------------------------------- */
exports.syncFromNBA = async (req, res) => {
  try {
    const espnSeries = await getPlayoffSeries();
    const results    = { created: 0, updated: 0, errors: 0 };

    for (const s of espnSeries) {
      try {
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
          existing.externalId  = s.externalId;
          existing.teamAWins   = s.teamAWins;
          existing.teamBWins   = s.teamBWins;
          if (s.teamAEspnId) existing.teamAEspnId = String(s.teamAEspnId);
          if (s.teamBEspnId) existing.teamBEspnId = String(s.teamBEspnId);
          if (s.startDate && !existing.startDate) existing.startDate = s.startDate;
          if (s.round && !existing.round) existing.round = s.round;
          if (s.startDate && new Date() >= new Date(s.startDate)) existing.isLocked = true;
          await existing.save();
          results.updated++;
        } else {
          const { teamAOdds, teamBOdds } = await getSeriesOdds(s.teamAEn, s.teamBEn);
          await Series.create({
            teamA:       s.teamAHe,
            teamB:       s.teamBHe,
            externalId:  s.externalId,
            teamAWins:   s.teamAWins,
            teamBWins:   s.teamBWins,
            round:       s.round,
            startDate:   s.startDate,
            teamAEspnId: s.teamAEspnId ? String(s.teamAEspnId) : undefined,
            teamBEspnId: s.teamBEspnId ? String(s.teamBEspnId) : undefined,
            isLocked:    s.startDate ? new Date() >= new Date(s.startDate) : false,
            betOptions: [
              { category: 'מנצחת הסדרה', choices: [{ name: s.teamAHe, odds: teamAOdds }, { name: s.teamBHe, odds: teamBOdds }] },
              { category: 'בכמה משחקים', choices: DEFAULT_GAMES_ODDS },
            ],
          });
          results.created++;
        }
      } catch (err) {
        console.error(`[Sync] ${s.teamAEn} vs ${s.teamBEn}:`, err.message);
        results.errors++;
      }
    }

    return res.json({ msg: 'Sync complete', totalFromESPN: espnSeries.length, ...results });
  } catch (err) {
    console.error('[Sync] Fatal:', err);
    return res.status(500).json({ msg: 'Sync failed', error: err.message });
  }
};

/* ── GET /api/sync/champion-odds  (public) ────────────────── */
exports.getChampionOdds = async (req, res) => {
  try {
    return res.json(await getChampionshipOdds());
  } catch (err) {
    return res.status(500).json({ msg: 'Failed to fetch champion odds' });
  }
};

/* ── GET /api/sync/test  (public) ─────────────────────────── */
exports.testConnection = async (req, res) => {
  try {
    return res.json(await testESPN());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ── GET /api/sync/teams  (public) ────────────────────────── */
exports.getTeams = (req, res) => {
  const teams = ALL_TEAMS.map((name) => ({ name, espnId: NBA_TEAM_IDS[name] }));
  return res.json(teams);
};

/* ── GET /api/sync/series-data?teamAHe=X&teamBHe=Y  (admin)
 * Returns FanDuel odds + ESPN rosters for both teams.
 * ----------------------------------------------------------- */
exports.getSeriesData = async (req, res) => {
  try {
    const { teamAHe, teamBHe } = req.query;
    if (!teamAHe || !teamBHe) return res.status(400).json({ msg: 'teamAHe and teamBHe required' });

    const teamAId  = NBA_TEAM_IDS[teamAHe];
    const teamBId  = NBA_TEAM_IDS[teamBHe];

    // Fetch rosters in parallel
    const [rosterA, rosterB] = await Promise.all([
      teamAId ? getTeamRoster(teamAId) : Promise.resolve([]),
      teamBId ? getTeamRoster(teamBId) : Promise.resolve([]),
    ]);

    // Get FanDuel odds — build Hebrew→English reverse map
    const EN_TO_HE = require('../services/teamNameMap');
    const HE_TO_EN = Object.fromEntries(Object.entries(EN_TO_HE).map(([en, he]) => [he, en]));
    const teamAEn = HE_TO_EN[teamAHe] || teamAHe;
    const teamBEn = HE_TO_EN[teamBHe] || teamBHe;
    const { teamAOdds, teamBOdds } = await getSeriesOdds(teamAEn, teamBEn);

    return res.json({
      teamAOdds,
      teamBOdds,
      rosterA,
      rosterB,
    });
  } catch (err) {
    console.error('[SeriesData]', err);
    return res.status(500).json({ msg: 'Failed to load series data' });
  }
};

/* ── POST /api/sync/cleanup  (admin) ─────────────────────────
 * Wipes all series, user bets, non-admin users, and leagues
 * except ישראל. Use before a new playoff season.
 * ----------------------------------------------------------- */
exports.cleanupDatabase = async (req, res) => {
  try {
    const User    = require('../models/User');
    const League  = require('../models/League');
    const UserBet = require('../models/UserBet');

    const [users, leagues, seriesRes, bets] = await Promise.all([
      User.deleteMany({ isAdmin: { $ne: true } }),
      League.deleteMany({ name: { $ne: 'ישראל' } }),
      Series.deleteMany({}),
      UserBet.deleteMany({}),
    ]);

    return res.json({
      msg: 'ניקוי הושלם',
      usersDeleted:   users.deletedCount,
      leaguesDeleted: leagues.deletedCount,
      seriesDeleted:  seriesRes.deletedCount,
      betsDeleted:    bets.deletedCount,
    });
  } catch (err) {
    console.error('[Cleanup]', err);
    return res.status(500).json({ msg: 'Cleanup failed', error: err.message });
  }
};

/* ── Daily stats sync (called by scheduler at 8am Israel) ─── */
exports.runDailyStatsSync = async () => {
  console.log('[DailySync] Starting player stats update...');
  const activeSeries = await Series.find({ isFinished: false, isLocked: true });

  for (const s of activeSeries) {
    try {
      const aId = s.teamAEspnId || String(NBA_TEAM_IDS[s.teamA] || '');
      const bId = s.teamBEspnId || String(NBA_TEAM_IDS[s.teamB] || '');
      if (!aId || !bId) continue;

      const stats = await getSeriesPlayerStats(aId, bId);
      if (stats.length > 0) {
        s.playerStats = stats;
        await s.save();
        console.log(`[DailySync] Updated stats for ${s.teamA} vs ${s.teamB} (${stats.length} players)`);
      }
    } catch (err) {
      console.error(`[DailySync] Error for ${s.teamA} vs ${s.teamB}:`, err.message);
    }
  }
  console.log('[DailySync] Done.');
};
