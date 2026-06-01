import React, { useState, useEffect } from 'react';
import { transliterateToHebrew } from '../../utils/transliterate';
import './SeriesModal.scss';

const GAMES_CHOICES = [
  { name: '4', odds: 3 },
  { name: '5', odds: 3 },
  { name: '6', odds: 3 },
  { name: '7', odds: 3 },
];

const OTHER = { name: 'אחר', odds: 1 };

const CAT_POINTS  = 'מלך הנקודות';
const CAT_REB     = 'מלך הריבאונד';
const CAT_ASSISTS = 'מלך האסיסטים';
const STANDARD_CATS = new Set(['מנצחת הסדרה', 'בכמה משחקים', CAT_POINTS, CAT_REB, CAT_ASSISTS]);

function withOther(list) {
  return [...list.filter((p) => p.name !== 'אחר'), OTHER];
}

/* ── Manual add-player form (fallback) ────────────────────── */
function AddPlayerForm({ onAdd }) {
  const [he, setHe] = useState('');
  const [en, setEn] = useState('');

  const submit = () => {
    const heTrim = he.trim();
    if (!heTrim) return;
    onAdd({ name: heTrim, nameEn: en.trim(), odds: 1 });
    setHe('');
    setEn('');
  };

  return (
    <div className="add-player-form">
      <input className="player-input-he" placeholder="שם בעברית" value={he}
        onChange={(e) => setHe(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <input className="player-input-en" placeholder="English (optional)" value={en}
        onChange={(e) => setEn(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <button type="button" className="add-player-btn" onClick={submit}>+ הוסף</button>
    </div>
  );
}

/* ── Player category block ────────────────────────────────── */
function PlayerCategory({ label, players, onManualAdd, onRemove }) {
  return (
    <div className="player-category">
      <div className="cat-header">
        <strong>{label}</strong>
        <span className="cat-count">{players.length} שחקנים</span>
      </div>
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
      <AddPlayerForm onAdd={onManualAdd} />
    </div>
  );
}

/* ── Custom bet block ─────────────────────────────────────── */
function CustomBetBlock({ bet, onChange, onRemove }) {
  const [newPlayer, setNewPlayer] = useState('');

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (!name || bet.choices.some((c) => c.name === name)) return;
    onChange({ ...bet, choices: [...bet.choices, { name, odds: 1 }] });
    setNewPlayer('');
  };

  const removePlayer = (name) =>
    onChange({ ...bet, choices: bet.choices.filter((c) => c.name !== name) });

  return (
    <div className="custom-bet-block">
      <div className="custom-bet-header">
        <input
          className="custom-bet-title-input"
          placeholder="כותרת ההימור (לדוג׳: שחקן MVP)"
          value={bet.category}
          onChange={(e) => onChange({ ...bet, category: e.target.value })}
        />
        <button type="button" className="remove-custom-bet-btn" onClick={onRemove}>✕</button>
      </div>
      <div className="player-list">
        {bet.choices.map((c) => (
          <div key={c.name} className="player-row">
            <span className="player-name">{c.name}</span>
            <button type="button" className="remove-btn" onClick={() => removePlayer(c.name)}>✕</button>
          </div>
        ))}
      </div>
      <div className="add-player-form">
        <input
          className="player-input-he"
          placeholder="שם שחקן"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
        />
        <button type="button" className="add-player-btn" onClick={addPlayer}>+ הוסף</button>
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

  const [winnerOdds,         setWinnerOdds]         = useState({ a: 1.9, b: 1.9 });
  const [scorers,            setScorers]            = useState([OTHER]);
  const [rebounders,         setRebounders]         = useState([OTHER]);
  const [assisters,          setAssisters]          = useState([OTHER]);
  const [customBets,         setCustomBets]         = useState([]);
  const [tiebreakerEnabled,  setTiebreakerEnabled]  = useState(false);
  const [tiebreakerQuestion, setTiebreakerQuestion] = useState('');

  // ESPN roster state
  const [roster,       setRoster]      = useState([]); // [{ nameEn, nameHe }]
  const [selectedEn,   setSelectedEn]  = useState(new Set()); // selected player nameEn
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterMsg,    setRosterMsg]   = useState('');

  // Load team dropdown
  useEffect(() => {
    fetch('/api/sync/teams')
      .then((r) => r.json())
      .then((d) => setAllTeams(Array.isArray(d) ? d.map((t) => t.name) : []))
      .catch(() => {});
  }, []);

  // Pre-populate when editing existing series
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
    if (winner?.choices?.length >= 2)
      setWinnerOdds({ a: winner.choices[0].odds, b: winner.choices[1].odds });

    const scorer    = opts.find((o) => o.category === CAT_POINTS);
    const rebounder = opts.find((o) => o.category === CAT_REB);
    const assister  = opts.find((o) => o.category === CAT_ASSISTS);
    setScorers(scorer?.choices    ? withOther(scorer.choices)    : [OTHER]);
    setRebounders(rebounder?.choices ? withOther(rebounder.choices) : [OTHER]);
    setAssisters(assister?.choices  ? withOther(assister.choices)  : [OTHER]);

    const custom = opts.filter((o) => !STANDARD_CATS.has(o.category));
    setCustomBets(custom.map((o) => ({ id: o._id || Math.random(), category: o.category, choices: o.choices || [] })));

    if (existingSeries.tiebreakerQuestion) {
      setTiebreakerEnabled(true);
      setTiebreakerQuestion(existingSeries.tiebreakerQuestion);
    }
    setStep(2);
  }, [existingSeries]);

  // ── Fetch ESPN roster ─────────────────────────────────────
  const loadRoster = async () => {
    if (!teamA || !teamB) return;
    setRosterLoading(true);
    setRosterMsg('');
    try {
      const res  = await fetch(
        `/api/sync/series-data?teamAHe=${encodeURIComponent(teamA)}&teamBHe=${encodeURIComponent(teamB)}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) { setRosterMsg(data.msg || 'שגיאה בטעינה'); return; }

      const combined = [
        ...(data.rosterA || []),
        ...(data.rosterB || []),
      ].map((nameEn) => ({ nameEn, nameHe: transliterateToHebrew(nameEn) }));

      setRoster(combined);
      setSelectedEn(new Set());
      setRosterMsg(combined.length ? '' : 'לא נמצאו שחקנים ב-ESPN');
    } catch {
      setRosterMsg('שגיאת רשת');
    } finally {
      setRosterLoading(false);
    }
  };

  // Toggle player selection in roster
  const togglePlayer = (nameEn) => {
    setSelectedEn((prev) => {
      const next = new Set(prev);
      next.has(nameEn) ? next.delete(nameEn) : next.add(nameEn);
      return next;
    });
  };

  // Add selected players to a specific category (or all)
  const addSelectedTo = (setters) => {
    const toAdd = roster
      .filter((p) => selectedEn.has(p.nameEn))
      .map((p) => ({ name: p.nameHe, odds: 1 }));
    if (!toAdd.length) return;

    const merge = (prev, newPlayers) =>
      withOther([
        ...prev.filter((p) => p.name !== 'אחר'),
        ...newPlayers.filter((np) => !prev.some((p) => p.name === np.name)),
      ]);

    setters.forEach((setter) => setter((prev) => merge(prev, toAdd)));
    setSelectedEn(new Set());
  };

  // ── Category helpers ──────────────────────────────────────
  const manualAdd  = (setter, player) =>
    setter((prev) => withOther([...prev.filter((p) => p.name !== 'אחר' && p.name !== player.name), { name: player.name, odds: 1 }]));

  const removeFrom = (setter, name) =>
    setter((prev) => prev.filter((p) => p.name !== name));

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const betOptions = [
        {
          category: 'מנצחת הסדרה',
          choices:  [
            { name: teamA, odds: parseFloat(winnerOdds.a) || 1.9 },
            { name: teamB, odds: parseFloat(winnerOdds.b) || 1.9 },
          ],
        },
        { category: 'בכמה משחקים', choices: GAMES_CHOICES },
        { category: CAT_POINTS,    choices: scorers },
        { category: CAT_REB,       choices: rebounders },
        { category: CAT_ASSISTS,   choices: assisters },
        ...customBets
          .filter((b) => b.category.trim() && b.choices.length > 0)
          .map((b) => ({ category: b.category.trim(), choices: b.choices })),
      ];

      const url    = existingSeries ? `/api/series/${existingSeries._id}` : '/api/series';
      const method = existingSeries ? 'PUT' : 'POST';
      const startDate = startDateStr ? new Date(startDateStr) : null;

      await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamA, teamB, betOptions, startDate,
          tiebreakerQuestion: tiebreakerEnabled && tiebreakerQuestion.trim() ? tiebreakerQuestion.trim() : null,
        }),
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

        {/* ── STEP 1 ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="step-1">
            <label className="modal-label">קבוצה א׳</label>
            <select className="modal-select" value={teamA} onChange={(e) => setTeamA(e.target.value)}>
              <option value="">-- בחר קבוצה --</option>
              {allTeams.filter((t) => t !== teamB).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label className="modal-label">קבוצה ב׳</label>
            <select className="modal-select" value={teamB} onChange={(e) => setTeamB(e.target.value)}>
              <option value="">-- בחר קבוצה --</option>
              {allTeams.filter((t) => t !== teamA).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label className="modal-label">תאריך התחלה (הניחושים ייסגרו אוטומטית)</label>
            <input type="datetime-local" className="modal-input"
              value={startDateStr} onChange={(e) => setStartDate(e.target.value)} />

            <div className="step1-actions">
              <button className="load-btn" onClick={() => setStep(2)} disabled={!teamA || !teamB}>
                הבא ←
              </button>
              <button className="cancel-btn" onClick={onClose}>בטל</button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="step-2">
            <div className="teams-summary">
              <span className="team-tag">{teamA}</span>
              <span className="vs-label">נגד</span>
              <span className="team-tag">{teamB}</span>
              <button type="button" className="back-btn" onClick={() => setStep(1)}>← שנה</button>
            </div>

            <label className="modal-label">תאריך התחלה</label>
            <input type="datetime-local" className="modal-input"
              value={startDateStr} onChange={(e) => setStartDate(e.target.value)} />

            {/* Winner odds */}
            <div className="odds-section">
              <h4 className="section-title">מנצחת הסדרה — יחסים</h4>
              <div className="winner-odds-row">
                <div className="odds-box">
                  <span>{teamA}</span>
                  <input type="number" step="0.1" min="1.1" value={winnerOdds.a}
                    onChange={(e) => setWinnerOdds((p) => ({ ...p, a: e.target.value }))} />
                </div>
                <div className="odds-box">
                  <span>{teamB}</span>
                  <input type="number" step="0.1" min="1.1" value={winnerOdds.b}
                    onChange={(e) => setWinnerOdds((p) => ({ ...p, b: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Games — fixed */}
            <div className="odds-section">
              <h4 className="section-title">בכמה משחקים — יחס קבוע: 3</h4>
              <div className="games-fixed-row">
                {GAMES_CHOICES.map((g) => (
                  <span key={g.name} className="game-fixed-badge">{g.name} משחקים</span>
                ))}
              </div>
            </div>

            {/* ESPN roster picker */}
            <div className="roster-section">
              <div className="roster-header">
                <strong>שחקנים מ-ESPN</strong>
                <button
                  type="button"
                  className="load-roster-btn"
                  onClick={loadRoster}
                  disabled={rosterLoading}
                >
                  {rosterLoading ? 'טוען...' : '⟳ טען שחקנים'}
                </button>
              </div>

              {rosterMsg && <p className="roster-msg">{rosterMsg}</p>}

              {roster.length > 0 && (
                <>
                  <div className="roster-chips">
                    {roster.map((p) => (
                      <button
                        key={p.nameEn}
                        type="button"
                        className={`roster-chip ${selectedEn.has(p.nameEn) ? 'selected' : ''}`}
                        onClick={() => togglePlayer(p.nameEn)}
                        title={p.nameHe}
                      >
                        {p.nameEn}
                      </button>
                    ))}
                  </div>
                  {selectedEn.size > 0 && (
                    <div className="add-to-cat-btns">
                      <span className="add-to-label">הוסף {selectedEn.size} שחקנים ל:</span>
                      <button type="button" onClick={() => addSelectedTo([setScorers])}>🏀 נקודות</button>
                      <button type="button" onClick={() => addSelectedTo([setRebounders])}>💪 ריבאונד</button>
                      <button type="button" onClick={() => addSelectedTo([setAssisters])}>🎯 אסיסטים</button>
                      <button type="button" className="add-all" onClick={() => addSelectedTo([setScorers, setRebounders, setAssisters])}>הכל</button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Player categories */}
            <PlayerCategory label={`🏀 ${CAT_POINTS}`} players={scorers}
              onManualAdd={(p) => manualAdd(setScorers, p)}
              onRemove={(n) => removeFrom(setScorers, n)} />
            <PlayerCategory label={`💪 ${CAT_REB}`} players={rebounders}
              onManualAdd={(p) => manualAdd(setRebounders, p)}
              onRemove={(n) => removeFrom(setRebounders, n)} />
            <PlayerCategory label={`🎯 ${CAT_ASSISTS}`} players={assisters}
              onManualAdd={(p) => manualAdd(setAssisters, p)}
              onRemove={(n) => removeFrom(setAssisters, n)} />

            {/* ── Custom bet categories ── */}
            <div className="custom-bets-section">
              <div className="custom-bets-header">
                <strong>הימורים מותאמים אישית</strong>
                <button
                  type="button"
                  className="add-custom-bet-btn"
                  onClick={() => setCustomBets((prev) => [...prev, { id: Date.now(), category: '', choices: [] }])}
                >
                  + הוסף הימור
                </button>
              </div>
              {customBets.map((bet) => (
                <CustomBetBlock
                  key={bet.id}
                  bet={bet}
                  onChange={(updated) => setCustomBets((prev) => prev.map((b) => b.id === bet.id ? updated : b))}
                  onRemove={() => setCustomBets((prev) => prev.filter((b) => b.id !== bet.id))}
                />
              ))}
            </div>

            {/* ── Tiebreaker ── */}
            <div className="tiebreaker-section">
              <div className="tiebreaker-header">
                <label className="tiebreaker-toggle-label">
                  <input
                    type="checkbox"
                    checked={tiebreakerEnabled}
                    onChange={(e) => setTiebreakerEnabled(e.target.checked)}
                  />
                  <strong>הוסף שאלת שובר שיוון</strong>
                </label>
                <span className="tiebreaker-hint">ללא יחס — משמש רק לקביעת מיקום בשיוון</span>
              </div>
              {tiebreakerEnabled && (
                <input
                  className="modal-input"
                  placeholder='לדוג׳: "כמה בלוקים יהיו לXXX בסדרה?"'
                  value={tiebreakerQuestion}
                  onChange={(e) => setTiebreakerQuestion(e.target.value)}
                />
              )}
            </div>

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
