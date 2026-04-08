import React, { useState, useEffect } from 'react';
import './SeriesModal.scss';

const GAMES_CHOICES = [
  { name: '4', odds: 3 },
  { name: '5', odds: 3 },
  { name: '6', odds: 3 },
  { name: '7', odds: 3 },
];

const OTHER = { name: 'אחר', odds: 1 };

function withOther(list) {
  return [...list.filter((p) => p.name !== 'אחר'), OTHER];
}

/* ── Add-player mini-form ─────────────────────────────────── */
function AddPlayerForm({ onAdd }) {
  const [he, setHe] = useState('');
  const [en, setEn] = useState('');

  const submit = () => {
    const heTrim = he.trim();
    if (!heTrim) return;
    const combined = en.trim() ? `${heTrim} / ${en.trim()}` : heTrim;
    onAdd({ name: combined, odds: 1 });
    setHe('');
    setEn('');
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="add-player-form">
      <input
        className="player-input-he"
        placeholder="שם בעברית"
        value={he}
        onChange={(e) => setHe(e.target.value)}
        onKeyDown={onKey}
      />
      <input
        className="player-input-en"
        placeholder="English name"
        value={en}
        onChange={(e) => setEn(e.target.value)}
        onKeyDown={onKey}
      />
      <button type="button" className="add-player-btn" onClick={submit}>+ הוסף</button>
    </div>
  );
}

/* ── Player category block ────────────────────────────────── */
function PlayerCategory({ label, players, onAdd, onRemove }) {
  return (
    <div className="player-category">
      <div className="cat-header">
        <strong>{label}</strong>
        <span className="cat-count">{players.length} שחקנים</span>
      </div>
      <AddPlayerForm onAdd={onAdd} />
      <div className="player-list">
        {players.map((p) => (
          <div key={p.name} className="player-row">
            <span className="player-name">{p.name}</span>
            {p.name !== 'אחר' && (
              <button type="button" className="remove-btn" onClick={() => onRemove(p.name)}>✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main modal ───────────────────────────────────────────── */
function SeriesModal({ onClose, onSave, existingSeries }) {
  const [step,         setStep]      = useState(1);
  const [allTeams,     setAllTeams]  = useState([]);
  const [teamA,        setTeamA]     = useState('');
  const [teamB,        setTeamB]     = useState('');
  const [startDateStr, setStartDate] = useState('');

  const [winnerOdds,  setWinnerOdds]  = useState({ a: 1.9, b: 1.9 });
  const [scorers,     setScorers]     = useState([OTHER]);
  const [rebounders,  setRebounders]  = useState([OTHER]);
  const [assisters,   setAssisters]   = useState([OTHER]);

  // Load team list on mount
  useEffect(() => {
    fetch('/api/sync/teams')
      .then((r) => r.json())
      .then((d) => setAllTeams(Array.isArray(d) ? d.map((t) => t.name) : []))
      .catch(() => {});
  }, []);

  // If editing existing series, pre-populate and skip to step 2
  useEffect(() => {
    if (!existingSeries) return;
    setTeamA(existingSeries.teamA || '');
    setTeamB(existingSeries.teamB || '');
    if (existingSeries.startDate) {
      const d = new Date(existingSeries.startDate);
      setStartDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
    const opts = existingSeries.betOptions || [];
    const winner = opts.find((o) => o.category === 'מנצחת הסדרה');
    if (winner?.choices?.length >= 2) {
      setWinnerOdds({ a: winner.choices[0].odds, b: winner.choices[1].odds });
    }
    const scorer    = opts.find((o) => o.category === 'מלך הניקוד');
    const rebounder = opts.find((o) => o.category === 'מלך הריבאונד');
    const assister  = opts.find((o) => o.category === 'מלך הבישוט');
    setScorers(scorer?.choices    ? withOther(scorer.choices)    : [OTHER]);
    setRebounders(rebounder?.choices ? withOther(rebounder.choices) : [OTHER]);
    setAssisters(assister?.choices  ? withOther(assister.choices)  : [OTHER]);
    setStep(2);
  }, [existingSeries]);

  // ── Helpers ───────────────────────────────────────────────
  const addTo    = (setter, player) =>
    setter((prev) => withOther([...prev.filter((p) => p.name !== 'אחר' && p.name !== player.name), player]));

  const removeFrom = (setter, name) =>
    setter((prev) => prev.filter((p) => p.name !== name));

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const startDate = startDateStr ? new Date(startDateStr) : null;
      const betOptions = [
        {
          category: 'מנצחת הסדרה',
          choices:  [
            { name: teamA, odds: parseFloat(winnerOdds.a) || 1.9 },
            { name: teamB, odds: parseFloat(winnerOdds.b) || 1.9 },
          ],
        },
        { category: 'בכמה משחקים', choices: GAMES_CHOICES },
        { category: 'מלך הניקוד',   choices: scorers },
        { category: 'מלך הריבאונד', choices: rebounders },
        { category: 'מלך הבישוט',   choices: assisters },
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

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="series-modal-overlay">
      <div className="series-modal">
        <h3 className="modal-title">
          {existingSeries ? 'עריכת סדרה' : 'יצירת סדרה חדשה'}
        </h3>

        {/* ── STEP 1: Pick teams ───────────────────────────── */}
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

            <div className="step1-actions">
              <button
                className="load-btn"
                onClick={() => setStep(2)}
                disabled={!teamA || !teamB}
              >
                הבא ←
              </button>
              <button className="cancel-btn" onClick={onClose}>בטל</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Configure odds & players ────────────── */}
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

            {/* Winner odds — editable */}
            <div className="odds-section">
              <h4 className="section-title">מנצחת הסדרה — יחסים</h4>
              <div className="winner-odds-row">
                <div className="odds-box">
                  <span>{teamA}</span>
                  <input
                    type="number" step="0.1" min="1.1"
                    value={winnerOdds.a}
                    onChange={(e) => setWinnerOdds((p) => ({ ...p, a: e.target.value }))}
                  />
                </div>
                <div className="odds-box">
                  <span>{teamB}</span>
                  <input
                    type="number" step="0.1" min="1.1"
                    value={winnerOdds.b}
                    onChange={(e) => setWinnerOdds((p) => ({ ...p, b: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Games count — fixed at 3 */}
            <div className="odds-section">
              <h4 className="section-title">בכמה משחקים — יחס קבוע: 3</h4>
              <div className="games-fixed-row">
                {GAMES_CHOICES.map((g) => (
                  <span key={g.name} className="game-fixed-badge">{g.name} משחקים</span>
                ))}
              </div>
            </div>

            {/* Player categories — all odds fixed at 1 */}
            <PlayerCategory
              label="🏀 מלך הניקוד"
              players={scorers}
              onAdd={(p) => addTo(setScorers, p)}
              onRemove={(n) => removeFrom(setScorers, n)}
            />
            <PlayerCategory
              label="💪 מלך הריבאונד"
              players={rebounders}
              onAdd={(p) => addTo(setRebounders, p)}
              onRemove={(n) => removeFrom(setRebounders, n)}
            />
            <PlayerCategory
              label="🎯 מלך הבישוט"
              players={assisters}
              onAdd={(p) => addTo(setAssisters, p)}
              onRemove={(n) => removeFrom(setAssisters, n)}
            />

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>שמור סדרה</button>
              <button className="cancel-btn" onClick={onClose}>בטל</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeriesModal;
