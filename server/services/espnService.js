// Fetches NBA playoff bracket data from ESPN's unofficial free API
const HEBREW_NAMES = require('./teamNameMap');

const PLAYOFFS_URL =
  'https://site.api.espn.com/apis/v2/sports/basketball/nba/playoffs';

async function getPlayoffSeries() {
  try {
    const res = await fetch(PLAYOFFS_URL);
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
          externalId:  s.uid || s.id || `${teamAEn}-${teamBEn}`,
          teamAEn,
          teamBEn,
          teamAHe:     HEBREW_NAMES[teamAEn] || teamAEn,
          teamBHe:     HEBREW_NAMES[teamBEn] || teamBEn,
          teamAWins:   parseInt(c1.wins) || 0,
          teamBWins:   parseInt(c2.wins) || 0,
          startDate:   s.startDate ? new Date(s.startDate) : null,
          round:       round.displayName || 'Playoffs',
        });
      }
    }
    return series;
  } catch (err) {
    console.error('[ESPN] Failed to fetch playoff data:', err.message);
    return [];
  }
}

module.exports = { getPlayoffSeries };
