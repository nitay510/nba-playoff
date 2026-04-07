import React, { useState, useEffect } from 'react';
import './SeriesModal.scss';

const DEFAULT_PLAYER_ODDS = 3.5;

// Default games-count odds
const GAMES_CHOICES = [
  { name: '4', odds: 5.5 },
  { name: '5', odds: 3.0 },
  { name: '6', odds: 2.5 },
  { name: '7', odds: 2.8 },
];

function SeriesModal({ onClose, onSave, existingSeries }) {
  const [step,         setStep]        = useState(1); // 1=pick teams, 2=configure
  const [allTeams,     setAllTeams]    = useState([]);
  const [teamA,        setTeamA]       = useState('');
  const [teamB,        setTeamB]       = useState('');
  const [startDateStr, setStartDate]   = useState('');
  const [loading,      setLoading]     = useState(false);
  const [loadMsg,      setLoadMsg]     = useState('');

  // Bet options state
  const [winnerOdds,   setWinnerOdds]  = useState({ a: 1.9, b: 1.9 });
  const [gamesOdds,    setGamesOdds]   = useState(GAMES_CHOICES);
  const [scorers,      setScorers]     = useState([]); // { name, odds }
  const [rebounders,   setRebounders]  = useState([]);
  const [assisters,    setAssisters]   = useState([]);

  // Load team list on mount
  useEffect(() => {
    fetch('/api/sync/teams')
      .then((r) => r.json())
      .then((d) => setAllTeams(Array.isArray(d) ? d.map((t) => t.name) : []))
      .catch(() => {});
  }, []);

  // If editing existing series, skip to step 2 with current values
  useEffect(() => {
    if (!existingSeries) return;
    setTeamA(existingSeries.teamA || '');
    setTeamB(existingSeries.teamB || '');
    if (existingSeries.startDate) {
      const d = new Date(existingSeries.startDate);
      setStartDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
    // Load existing bet options into state
    const opts = existingSeries.betOptions || [];
    const winner = opts.find((o) => o.category === 'מנצחת הסדרה');
    if (winner?.choices?.length >= 2) {
      setWinnerOdds({ a: winner.choices[0].odds, b: winner.choices[1].odds });
    }
    const games = opts.find((o) => o.category === 'בכמה משחקים');
    if (games?.choices) setGamesOdds(games.choices);
    const scorer    = opts.find((o) => o.category === 'מלך הניקוד');
    const rebounder = opts.find((o) => o.category === 'מלך הריבאונד');
    const assister  = opts.find((o) => o.category === 'מלך הבישוט');
    if (scorer?.choices)    setScorers(scorer.choices);
    if (rebounder?.choices) setRebounders(rebounder.choices);
    if (assister?.choices)  setAssisters(assister.choices);
    setStep(2);
  }, [existingSeries]);

  // ── Load FanDuel odds + ESPN rosters ───────────────────────
  const loadData = async () => {
    if (!teamA || !teamB) { setLoadMsg('בחר שתי קבוצות'); return; }
    if (teamA === teamB)  { setLoadMsg('הקבוצות חייבות להיות שונות'); return; }
    setLoading(true);
    setLoadMsg('טוען יחסים ורשימות שחקנים...');
    try {
      const res  = await fetch(
        `/api/sync/series-data?teamAHe=${encodeURIComponent(teamA)}&teamBHe=${encodeURIComponent(teamB)}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) { setLoadMsg(data.msg || 'שגיאה בטעינה'); setLoading(false); return; }

      setWinnerOdds({ a: data.teamAOdds || 1.9, b: data.teamBOdds || 1.9 });

      // Build player choices from combined roster
      const allPlayers = [
        ...(data.rosterA || []).map((n) => ({ name: n, odds: DEFAULT_PLAYER_ODDS })),
        ...(data.rosterB || []).map((n) => ({ name: n, odds: DEFAULT_PLAYER_ODDS })),
      ];
      setScorers([...allPlayers]);
      setRebounders([...allPlayers]);
      setAssisters([...allPlayers]);

      setLoadMsg('');
      setStep(2);
    } catch (err) {
      setLoadMsg('שגיאת רשת');
    } finally {
      setLoading(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const startDate = startDateStr ? new Date(startDateStr) : null;
      const betOptions = [
        {
          category: 'מנצחת הסדרה',
          choices:  [{ name: teamA, odds: parseFloat(winnerOdds.a) || 1.9 },
                     { name: teamB, odds: parseFloat(winnerOdds.b) || 1.9 }],
        },
        {
          category: 'בכמה משחקים',
          choices:  gamesOdds,
        },
        ...(scorers.length    ? [{ category: 'מלך הניקוד',  choices: scorers }]    : []),
        ...(rebounders.length ? [{ category: 'מלך הריבאונד', choices: rebounders }] : []),
        ...(assisters.length  ? [{ category: 'מלך הבישוט',  choices: assisters }]  : []),
      ];

      const url    = existingSeries ? `/api/series/${existingSeries._id}` : '/api/series';
      const method = existingSeries ? 'PUT' : 'POST';

      await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamA, teamB, betOptions, startDate }),
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // ── Player list helpers ────────────────────────────────────
  const removePlayer = (setter, name) =>
    setter((prev) => prev.filter((p) => p.name !== name));

  const updatePlayerOdds = (setter, name, val) =>
    setter((prev) => prev.map((p) => p.name === name ? { ...p, odds: parseFloat(val) || DEFAULT_PLAYER_ODDS } : p));

  const PlayerRow = ({ player, onRemove, onOddsChange }) => (
    <div className="player-row">
      <span className="player-name">{player.name}</span>
      <input
        type="number" step="0.1" min="1.1"
        className="player-odds-input"
        value={player.odds}
        onChange={(e) => onOddsChange(player.name, e.target.value)}
      />
      <button type="button" className="remove-btn" onClick={() => onRemove(player.name)}>✕</button>
    </div>
  );

  const PlayerCategory = ({ label, players, setter }) => (
    <div className="player-category">
      <div className="cat-header">
        <strong>{label}</strong>
        <span className="cat-count">{players.length} שחקנים</span>
      </div>
      <div className="player-list">
        {players.map((p) => (
          <PlayerRow key={p.name} player={p}
            onRemove={(n) => removePlayer(setter, n)}
            onOddsChange={(n, v) => updatePlayerOdds(setter, n, v)}
          />
        ))}
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="series-modal-overlay">
      <div className="series-modal">
        <h3 className="modal-title">
          {existingSeries ? 'עריכת סדרה' : 'יצירת סדרה חדשה'}
        </h3>

        {/* ── STEP 1: Pick teams ─────────────────────────── */}
        {step === 1 && (
          <div className="step-1">
            <label className="modal-label">קבוצה א׳</label>
            <select className="modal-select" value={teamA} onChange={(e) => setTeamA(e.target.value)}>
              <option value="">-- בחר קבוצה --</option>
              {allTeams.filter((t) => t !== teamB).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <label className="modal-label">קבוצה ב׳</label>
            <select className="modal-select" value={teamB} onChange={(e) => setTeamB(e.target.value)}>
              <option value="">-- בחר קבוצה --</option>
              {allTeams.filter((t) => t !== teamA).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <label className="modal-label">תאריך התחלה (הניחושים ייסגרו אוטומטית)</label>
            <input
              type="datetime-local" className="modal-input"
              value={startDateStr} onChange={(e) => setStartDate(e.target.value)}
            />

            {loadMsg && <p className="load-msg error">{loadMsg}</p>}

            <div className="step1-actions">
              <button className="load-btn" onClick={loadData} disabled={loading || !teamA || !teamB}>
                {loading ? 'טוען...' : '⟳ טען יחסים ושחקנים מ-ESPN'}
              </button>
              <button className="cancel-btn" onClick={onClose}>בטל</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Configure odds ─────────────────────── */}
        {step === 2 && (
          <div className="step-2">
            <div className="teams-summary">
              <span className="team-tag">{teamA}</span>
              <span className="vs-label">נגד</span>
              <span className="team-tag">{teamB}</span>
              <button type="button" className="back-btn" onClick={() => setStep(1)}>← שנה</button>
            </div>

            <label className="modal-label">תאריך התחלה</label>
            <input
              type="datetime-local" className="modal-input"
              value={startDateStr} onChange={(e) => setStartDate(e.target.value)}
            />

            {/* Series winner odds */}
            <div className="odds-section">
              <h4 className="section-title">מנצחת הסדרה — יחסי FanDuel</h4>
              <div className="winner-odds-row">
                <div className="odds-box">
                  <span>{teamA}</span>
                  <input type="number" step="0.1" min="1.1"
                    value={winnerOdds.a}
                    onChange={(e) => setWinnerOdds((p) => ({ ...p, a: e.target.value }))}
                  />
                </div>
                <div className="odds-box">
                  <span>{teamB}</span>
                  <input type="number" step="0.1" min="1.1"
                    value={winnerOdds.b}
                    onChange={(e) => setWinnerOdds((p) => ({ ...p, b: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Games count odds */}
            <div className="odds-section">
              <h4 className="section-title">בכמה משחקים</h4>
              <div className="games-row">
                {gamesOdds.map((g, i) => (
                  <div key={g.name} className="odds-box small">
                    <span>{g.name} משחקים</span>
                    <input type="number" step="0.1" min="1.1"
                      value={g.odds}
                      onChange={(e) => {
                        const updated = [...gamesOdds];
                        updated[i] = { ...g, odds: parseFloat(e.target.value) || g.odds };
                        setGamesOdds(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Player categories */}
            {scorers.length > 0 && (
              <PlayerCategory label="🏀 מלך הניקוד"  players={scorers}    setter={setScorers} />
            )}
            {rebounders.length > 0 && (
              <PlayerCategory label="💪 מלך הריבאונד" players={rebounders} setter={setRebounders} />
            )}
            {assisters.length > 0 && (
              <PlayerCategory label="🎯 מלך הבישוט"  players={assisters}  setter={setAssisters} />
            )}

            {scorers.length === 0 && (
              <p className="no-players-note">שחקנים לא נמצאו. ניתן לשמור ללא קטגוריות שחקנים.</p>
            )}

            <div className="modal-actions">
              <button className="save-btn"   onClick={handleSave}>שמור סדרה</button>
              <button className="cancel-btn" onClick={onClose}>בטל</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeriesModal;
