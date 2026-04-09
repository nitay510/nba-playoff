// ESPN unofficial free API — no key needed
const HEBREW_NAMES  = require('./teamNameMap');
const { NBA_TEAM_IDS } = require('./nbaTeamIds');

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const BASE2 = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';

/* ──────────────────────────────────────────────────────────────
 * Playoff bracket (series + win counts)
 * ────────────────────────────────────────────────────────────── */
async function getPlayoffSeries() {
  try {
    const res = await fetch(`${BASE2}/playoffs`);
    if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
    const data = await res.json();

    const series = [];
    for (const round of data.rounds || []) {
      for (const s of round.series || []) {
        const [c1, c2] = s.competitors || [];
        if (!c1 || !c2) continue;

        const teamAEn = c1.team?.displayName || '';
        const teamBEn = c2.team?.displayName || '';

        series.push({
          externalId: s.uid || s.id || `${teamAEn}-${teamBEn}`,
          teamAEn,
          teamBEn,
          teamAHe:    HEBREW_NAMES[teamAEn] || teamAEn,
          teamBHe:    HEBREW_NAMES[teamBEn] || teamBEn,
          teamAWins:  parseInt(c1.wins) || 0,
          teamBWins:  parseInt(c2.wins) || 0,
          startDate:  s.startDate ? new Date(s.startDate) : null,
          round:      round.displayName || 'Playoffs',
          // ESPN IDs for box-score queries
          teamAEspnId: c1.team?.id,
          teamBEspnId: c2.team?.id,
        });
      }
    }
    return series;
  } catch (err) {
    console.error('[ESPN] Playoff series error:', err.message);
    return [];
  }
}

/* ──────────────────────────────────────────────────────────────
 * Team roster — returns array of player display names
 * ────────────────────────────────────────────────────────────── */
async function getTeamRoster(espnTeamId) {
  try {
    const res = await fetch(`${BASE}/teams/${espnTeamId}/roster`);
    if (!res.ok) throw new Error(`ESPN roster ${res.status}`);
    const data = await res.json();
    // data.athletes can be a flat array or grouped by position
    const athletes = Array.isArray(data.athletes)
      ? data.athletes
      : (data.athletes || []).flatMap((g) => g.items || g.athletes || []);
    return athletes.map((a) => a.displayName || a.fullName || '').filter(Boolean);
  } catch (err) {
    console.error(`[ESPN] Roster error (id=${espnTeamId}):`, err.message);
    return [];
  }
}

/* ──────────────────────────────────────────────────────────────
 * Series player stats — aggregate pts/reb/ast across all played games
 * Uses team schedule (seasontype=3 = playoffs) + event summaries
 * ────────────────────────────────────────────────────────────── */
async function getSeriesPlayerStats(teamAEspnId, teamBEspnId) {
  try {
    // Get playoff schedule for team A
    const schedRes = await fetch(
      `${BASE}/teams/${teamAEspnId}/schedule?season=2026&seasontype=3`
    );
    if (!schedRes.ok) return [];
    const schedData = await schedRes.json();

    // Filter for completed games against team B
    const teamBStr = String(teamBEspnId);
    const events = (schedData.events || []).filter((e) => {
      const comps = e.competitions?.[0]?.competitors || [];
      const isVsTeamB = comps.some((c) => String(c.team?.id) === teamBStr);
      const isCompleted = e.competitions?.[0]?.status?.type?.completed === true;
      return isVsTeamB && isCompleted;
    });

    if (!events.length) return [];

    // Aggregate player stats across all games
    const playerMap = {};

    for (const event of events) {
      try {
        const sumRes = await fetch(`${BASE}/summary?event=${event.id}`);
        if (!sumRes.ok) continue;
        const summary = await sumRes.json();

        for (const teamBox of (summary.boxscore?.players || [])) {
          const teamName = teamBox.team?.displayName || '';
          for (const statGroup of (teamBox.statistics || [])) {
            const keys = statGroup.keys || [];
            const ptsIdx = keys.indexOf('PTS');
            const rebIdx = keys.indexOf('REB');
            const astIdx = keys.indexOf('AST');

            for (const athlete of (statGroup.athletes || [])) {
              const name = athlete.athlete?.displayName;
              if (!name || !athlete.stats?.length) continue;
              if (!playerMap[name]) {
                playerMap[name] = { playerName: name, teamName, points: 0, rebounds: 0, assists: 0 };
              }
              if (ptsIdx >= 0) playerMap[name].points  += parseFloat(athlete.stats[ptsIdx]) || 0;
              if (rebIdx >= 0) playerMap[name].rebounds += parseFloat(athlete.stats[rebIdx]) || 0;
              if (astIdx >= 0) playerMap[name].assists  += parseFloat(athlete.stats[astIdx]) || 0;
            }
          }
        }
      } catch (err) {
        console.error(`[ESPN] Box score error (event ${event.id}):`, err.message);
      }
    }

    return Object.values(playerMap);
  } catch (err) {
    console.error('[ESPN] Series stats error:', err.message);
    return [];
  }
}

/* ──────────────────────────────────────────────────────────────
 * Quick connectivity test — uses the teams endpoint (always available)
 * ────────────────────────────────────────────────────────────── */
async function testESPN() {
  try {
    // Test 1: teams list (always works)
    const teamsRes = await fetch(`${BASE}/teams?limit=5`);
    const teamsOk  = teamsRes.ok;
    const teamsData = teamsOk ? await teamsRes.json() : null;
    const sampleTeams = (teamsData?.sports?.[0]?.leagues?.[0]?.teams || [])
      .slice(0, 3)
      .map((t) => t.team?.displayName);

    // Test 2: playoff bracket (returns empty rounds outside of playoffs)
    const playoffsRes  = await fetch(`${BASE2}/playoffs`);
    const playoffsOk   = playoffsRes.ok;
    const playoffsData = playoffsOk ? await playoffsRes.json() : null;
    const roundCount   = playoffsData?.rounds?.length || 0;
    const seriesTotal  = (playoffsData?.rounds || []).reduce(
      (n, r) => n + (r.series?.length || 0), 0
    );

    return {
      teamsEndpoint:    teamsOk ? 'OK' : 'FAIL',
      playoffsEndpoint: playoffsOk ? 'OK' : 'FAIL',
      sampleTeams,
      playoffRounds:    roundCount,
      playoffSeries:    seriesTotal,
      note: seriesTotal === 0
        ? 'No active playoffs right now — the bracket will populate once playoffs begin.'
        : `${seriesTotal} series found across ${roundCount} rounds.`,
    };
  } catch (err) {
    return { error: err.message };
  }
}

/* ──────────────────────────────────────────────────────────────
 * Series game-by-game scores (completed + live)
 * ────────────────────────────────────────────────────────────── */
async function getSeriesGames(teamAEspnId, teamBEspnId) {
  if (!teamAEspnId || !teamBEspnId) return [];
  try {
    const res = await fetch(
      `${BASE}/teams/${teamAEspnId}/schedule?season=2026&seasontype=3`
    );
    if (!res.ok) return [];
    const data = await res.json();

    const teamBStr = String(teamBEspnId);
    const games = [];

    for (const event of (data.events || [])) {
      const comp  = event.competitions?.[0];
      const comps = comp?.competitors || [];
      if (!comps.some((c) => String(c.team?.id) === teamBStr)) continue;

      const status = comp?.status?.type;
      const isCompleted = status?.completed === true;
      const isLive      = status?.state === 'in';
      if (!isCompleted && !isLive) continue;

      const home = comps.find((c) => c.homeAway === 'home') || comps[0];
      const away = comps.find((c) => c.homeAway === 'away') || comps[1];

      games.push({
        id:         event.id,
        date:       event.date,
        isCompleted,
        isLive,
        statusText: status?.shortDetail || '',
        homeTeam:   home?.team?.displayName || '',
        awayTeam:   away?.team?.displayName || '',
        homeScore:  home?.score != null ? parseInt(home.score) : null,
        awayScore:  away?.score != null ? parseInt(away.score) : null,
      });
    }

    return games.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (err) {
    console.error('[ESPN] Series games error:', err.message);
    return [];
  }
}

module.exports = { getPlayoffSeries, getTeamRoster, getSeriesPlayerStats, getSeriesGames, testESPN };
