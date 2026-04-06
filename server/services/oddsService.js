// Fetches NBA odds from The Odds API (https://the-odds-api.com)
// Free tier: 500 requests/month — set ODDS_API_KEY in your .env
const HEBREW_NAMES = require('./teamNameMap');

const BASE = 'https://api.the-odds-api.com/v4';

/**
 * Clamp any decimal odds to the 1.5–10 range the app uses.
 */
function clampOdds(price) {
  const n = parseFloat(price);
  if (!Number.isFinite(n) || n <= 0) return 2.0;
  return parseFloat(Math.min(Math.max(n, 1.5), 10).toFixed(2));
}

/**
 * Fetch all current NBA game odds from FanDuel (decimal format).
 * Returns [] when the API key is missing or the request fails.
 */
async function fetchNBAOdds(market = 'h2h') {
  const key = process.env.ODDS_API_KEY;
  if (!key) return [];
  try {
    const url =
      `${BASE}/sports/basketball_nba/odds` +
      `?apiKey=${key}&regions=us&markets=${market}&bookmakers=fanduel&oddsFormat=decimal`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[OddsAPI] HTTP', res.status);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('[OddsAPI] fetch error:', err.message);
    return [];
  }
}

/**
 * Find FanDuel h2h odds for a specific matchup.
 * teamAEn / teamBEn are the ESPN English team names.
 * Returns { teamAOdds, teamBOdds } clamped to 1.5–10.
 */
async function getSeriesOdds(teamAEn, teamBEn) {
  const events = await fetchNBAOdds('h2h');

  // Look for an event that matches these two teams
  for (const evt of events) {
    const home = evt.home_team;
    const away = evt.away_team;
    const isMatch =
      (home === teamAEn && away === teamBEn) ||
      (home === teamBEn && away === teamAEn);

    if (!isMatch) continue;

    const fb = evt.bookmakers?.find((b) => b.key === 'fanduel');
    if (!fb) continue;
    const h2h = fb.markets?.find((m) => m.key === 'h2h');
    if (!h2h) continue;

    const getPrice = (name) =>
      clampOdds(h2h.outcomes.find((o) => o.name === name)?.price);

    return {
      teamAOdds: getPrice(teamAEn),
      teamBOdds: getPrice(teamBEn),
    };
  }

  // Default: even odds
  return { teamAOdds: 1.9, teamBOdds: 1.9 };
}

/**
 * Fetch NBA Championship winner (outrights) odds from FanDuel.
 * Returns an array of { teamEn, teamHe, odds } sorted by odds ascending.
 */
async function getChampionshipOdds() {
  const events = await fetchNBAOdds('outrights');

  // Championship outrights usually come as a single "event"
  for (const evt of events) {
    const fb = evt.bookmakers?.find((b) => b.key === 'fanduel');
    if (!fb) continue;
    const outrights = fb.markets?.find((m) => m.key === 'outrights');
    if (!outrights) continue;

    return outrights.outcomes
      .map((o) => ({
        teamEn: o.name,
        teamHe: HEBREW_NAMES[o.name] || o.name,
        odds:   clampOdds(o.price),
      }))
      .sort((a, b) => a.odds - b.odds);
  }

  return [];
}

module.exports = { getSeriesOdds, getChampionshipOdds, clampOdds };
