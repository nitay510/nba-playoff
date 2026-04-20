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

    // 404 = bracket not published yet (pre-playoffs / between rounds) — not an error
    if (res.status === 404) {
      console.log('[ESPN] Playoff bracket not available yet — will retry later');
      return [];
    }
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
      // Per-game map: first stat group that has PTS/REB/AST wins (avoids double-counting
      // when ESPN returns multiple stat groups like "Starters" + "Bench" for the same player)
      const gamePlayerMap = {};

      try {
        const sumRes = await fetch(`${BASE}/summary?event=${event.id}`);
        if (!sumRes.ok) continue;
        const summary = await sumRes.json();

        // ESPN returns boxscore.players OR boxscore.teams depending on the endpoint version
        const teamBoxes = summary.boxscore?.players || summary.boxscore?.teams || [];
        for (const teamBox of teamBoxes) {
          const teamName = teamBox.team?.displayName || '';
          for (const statGroup of (teamBox.statistics || [])) {
            // ESPN uses 'names' in box score responses; 'keys' is a fallback
            const keys = statGroup.names || statGroup.keys || statGroup.labels || [];
            const ptsIdx = keys.indexOf('PTS');
            const rebIdx = keys.indexOf('REB');
            const astIdx = keys.indexOf('AST');

            if (ptsIdx < 0 && rebIdx < 0 && astIdx < 0) continue;

            for (const athlete of (statGroup.athletes || [])) {
              const name = athlete.athlete?.displayName;
              if (!name || !athlete.stats?.length) continue;
              if (gamePlayerMap[name]) continue; // already captured this player for this game

              const pts = ptsIdx >= 0 ? parseFloat(athlete.stats[ptsIdx]) || 0 : 0;
              const reb = rebIdx >= 0 ? parseFloat(athlete.stats[rebIdx]) || 0 : 0;
              const ast = astIdx >= 0 ? parseFloat(athlete.stats[astIdx]) || 0 : 0;
              gamePlayerMap[name] = { teamName, points: pts, rebounds: reb, assists: ast };
            }
          }
        }
      } catch (err) {
        console.error(`[ESPN] Box score error (event ${event.id}):`, err.message);
      }

      // Accumulate this game's stats into series totals
      for (const [name, g] of Object.entries(gamePlayerMap)) {
        if (!playerMap[name]) {
          playerMap[name] = { playerName: name, teamName: g.teamName, points: 0, rebounds: 0, assists: 0 };
        }
        playerMap[name].points   += g.points;
        playerMap[name].rebounds += g.rebounds;
        playerMap[name].assists  += g.assists;
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

    // Test 2: playoff bracket (404 = not published yet, that's normal)
    const playoffsRes    = await fetch(`${BASE2}/playoffs`);
    const bracketMissing = playoffsRes.status === 404;
    const playoffsOk     = playoffsRes.ok;
    const playoffsData   = playoffsOk ? await playoffsRes.json() : null;
    const roundCount     = playoffsData?.rounds?.length || 0;
    const seriesTotal    = (playoffsData?.rounds || []).reduce(
      (n, r) => n + (r.series?.length || 0), 0
    );

    return {
      teamsEndpoint:    teamsOk ? 'OK' : 'FAIL',
      playoffsEndpoint: bracketMissing ? 'NOT_READY_YET' : playoffsOk ? 'OK' : 'FAIL',
      sampleTeams,
      playoffRounds:    roundCount,
      playoffSeries:    seriesTotal,
      note: bracketMissing
        ? 'Bracket not published yet (play-in in progress or pre-season) — will auto-populate once playoffs begin.'
        : seriesTotal === 0
          ? 'No active playoffs right now.'
          : `${seriesTotal} series found across ${roundCount} rounds.`,
    };
  } catch (err) {
    return { error: err.message };
  }
}

/* ──────────────────────────────────────────────────────────────
 * Helper: parse a score value from ESPN (string, number, or object)
 * ────────────────────────────────────────────────────────────── */
function parseScore(raw) {
  if (raw == null) return null;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'object') return parseScore(raw.value ?? raw.displayValue);
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }
  return null;
}

function parseBool(raw) {
  return raw === true || raw === 'true';
}

/* ──────────────────────────────────────────────────────────────
 * Series game-by-game scores (completed + live)
 * Scores come from the game summary endpoint (more reliable than schedule).
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
    const events = [];

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

      // Try to get scores from the schedule response first
      let homeScore = parseScore(home?.score);
      let awayScore = parseScore(away?.score);
      let homeWon   = parseBool(home?.winner);
      let awayWon   = parseBool(away?.winner);

      events.push({
        id:         event.id,
        date:       event.date,
        isCompleted,
        isLive,
        statusText: status?.shortDetail || '',
        homeTeam:   home?.team?.displayName || '',
        awayTeam:   away?.team?.displayName || '',
        homeTeamId: home?.team?.id ? String(home.team.id) : '',
        awayTeamId: away?.team?.id ? String(away.team.id) : '',
        homeScore,
        awayScore,
        homeWon,
        awayWon,
      });
    }

    // For completed games missing scores, fetch the summary endpoint (scores are always there)
    await Promise.all(
      events.map(async (game) => {
        if (!game.isCompleted) return;
        if (game.homeScore != null && game.awayScore != null) return; // already have scores

        try {
          const sumRes = await fetch(`${BASE}/summary?event=${game.id}`);
          if (!sumRes.ok) return;
          const sum = await sumRes.json();

          // Scores are in header.competitions[0].competitors
          const hComps = sum.header?.competitions?.[0]?.competitors || [];
          const hHome  = hComps.find((c) => c.homeAway === 'home') || hComps[0];
          const hAway  = hComps.find((c) => c.homeAway === 'away') || hComps[1];

          if (hHome || hAway) {
            game.homeScore = parseScore(hHome?.score);
            game.awayScore = parseScore(hAway?.score);
            game.homeWon   = parseBool(hHome?.winner) || (game.homeScore != null && game.awayScore != null && game.homeScore > game.awayScore);
            game.awayWon   = parseBool(hAway?.winner) || (game.homeScore != null && game.awayScore != null && game.awayScore > game.homeScore);
          }
        } catch (err) {
          console.error(`[ESPN] Summary score fallback error (event ${game.id}):`, err.message);
        }
      })
    );

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (err) {
    console.error('[ESPN] Series games error:', err.message);
    return [];
  }
}

module.exports = { getPlayoffSeries, getTeamRoster, getSeriesPlayerStats, getSeriesGames, testESPN };
