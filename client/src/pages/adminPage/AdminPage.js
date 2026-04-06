// client/src/pages/adminPage/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsModal from './ResultsModal';
import SeriesModal from './SeriesModal';
import CountdownClock from '../../components/CountdownClock';
import TeamLogo from '../../components/TeamLogo';
import './AdminPage.scss';

function AdminPage() {
  const navigate = useNavigate();

  const [seriesList,       setSeriesList]       = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentSeries,    setCurrentSeries]    = useState(null);
  const [showSeriesModal,  setShowSeriesModal]  = useState(false);
  const [editSeries,       setEditSeries]       = useState(null);
  const [syncing,          setSyncing]          = useState(false);
  const [syncMsg,          setSyncMsg]          = useState('');

  useEffect(() => { fetchUnfinishedSeries(); }, []);

  const fetchUnfinishedSeries = async () => {
    try {
      const res  = await fetch('/api/series', { credentials: 'include' });
      const data = await res.json();
      setSeriesList(data.filter((s) => !s.isFinished));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Sync from NBA (ESPN + FanDuel) ── */
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res  = await fetch('/api/sync/run', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      setSyncMsg(
        res.ok
          ? `✓ סנכרון הושלם: ${data.created} חדשות, ${data.updated} עודכנו`
          : `✗ שגיאה: ${data.msg}`
      );
      fetchUnfinishedSeries();
    } catch (err) {
      setSyncMsg('✗ שגיאת רשת בסנכרון');
    } finally {
      setSyncing(false);
    }
  };

  const openResultsModal  = (s) => { setCurrentSeries(s); setShowResultsModal(true); };
  const onResultsSaved    = () => { setShowResultsModal(false); fetchUnfinishedSeries(); };
  const handleCreateNew   = () => { setEditSeries(null); setShowSeriesModal(true); };
  const onSeriesModalSave = () => { setShowSeriesModal(false); fetchUnfinishedSeries(); };

  /* ── Series score badge ── */
  const ScoreBadge = ({ s }) => {
    const aW = s.teamAWins ?? 0;
    const bW = s.teamBWins ?? 0;
    if (aW === 0 && bW === 0) return null;
    return (
      <span className="score-badge">
        {s.teamA} {aW} – {bW} {s.teamB}
      </span>
    );
  };

  return (
    <div className="admin-page container">
      <h2>ניהול סדרות</h2>

      {/* Top action buttons */}
      <div className="admin-actions">
        <button onClick={handleCreateNew} className="create-series-btn">
          + צור סדרה חדשה
        </button>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="sync-btn"
          title="מושך סדרות פלייאוף מ-ESPN ויחסים מ-FanDuel"
        >
          {syncing ? 'מסנכרן...' : '⟳ סנכרן מ-NBA / FanDuel'}
        </button>
        <button onClick={() => navigate('/admin/finished')} className="finished-btn">
          ראה סדרות שהסתיימו
        </button>
      </div>

      {syncMsg && <p className="sync-msg">{syncMsg}</p>}

      <div className="series-list">
        {seriesList.length === 0 ? (
          <p>אין סדרות פעילות. לחץ "סנכרן מ-NBA" כדי למשוך אוטומטית.</p>
        ) : (
          seriesList.map((s) => {
            let countdownText;
            if (s.startDate) {
              countdownText = new Date(s.startDate) > new Date()
                ? <CountdownClock startDate={s.startDate} />
                : 'הסדרה התחילה';
            } else {
              countdownText = 'אין תאריך התחלה';
            }

            return (
              <div key={s._id} className="series-card">
                <div className="series-card-header">
                  <TeamLogo teamName={s.teamA} className="admin-logo" />
                  <div className="series-card-info">
                    <h3>{s.teamA} נגד {s.teamB}</h3>
                    <ScoreBadge s={s} />
                    {s.round && <span className="round-badge">{s.round}</span>}
                    <p>תאריך: {s.startDate ? new Date(s.startDate).toLocaleString('he-IL') : '---'}</p>
                    <p>ספירה: {countdownText}</p>
                    <p>נעול: {s.isLocked ? '🔒 כן' : '🔓 לא'}</p>
                  </div>
                  <TeamLogo teamName={s.teamB} className="admin-logo" />
                </div>
                <button className="results-btn" onClick={() => openResultsModal(s)}>
                  הגדר תוצאות סופיות
                </button>
              </div>
            );
          })
        )}
      </div>

      {showResultsModal && currentSeries && (
        <ResultsModal
          series={currentSeries}
          onClose={() => setShowResultsModal(false)}
          onResultsSaved={onResultsSaved}
        />
      )}

      {showSeriesModal && (
        <SeriesModal
          onClose={() => setShowSeriesModal(false)}
          onSave={onSeriesModalSave}
          existingSeries={editSeries}
        />
      )}
    </div>
  );
}

export default AdminPage;
