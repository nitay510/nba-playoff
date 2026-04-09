import React, { useState, useEffect, useCallback } from 'react';
import TeamLogo from '../../components/TeamLogo';
import { transliterateToHebrew } from '../../utils/transliterate';
import './SeriesStatsModal.scss';

/* ── Top-N players sorted by a stat key ── */
function StatCategory({ title, players, statKey, statLabel }) {
  const sorted = [...players].sort((a, b) => b[statKey] - a[statKey]).slice(0, 7);
  if (!sorted.length) return null;

  return (
    <div className="stat-cat">
      <h4 className="cat-title">{title}</h4>
      {sorted.map((p, i) => (
        <div key={p.playerName} className={`stat-row ${i === 0 ? 'leader' : ''}`}>
          <span className="stat-rank">#{i + 1}</span>
          <span className="stat-name">{transliterateToHebrew(p.playerName)}</span>
          <span className="stat-val">{p[statKey]} {statLabel}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Game score row ── */
function GameRow({ game, index, teamAName, teamBName }) {
  // Map ESPN team display names back to Hebrew names for display
  const homeHe = game.homeTeam;
  const awayHe = game.awayTeam;

  return (
    <div className={`game-row ${game.isLive ? 'is-live' : ''}`}>
      <span className="game-num">משחק {index + 1}</span>
      <span className="game-score">
        {homeHe} <b>{game.homeScore ?? '–'}</b>
        <span className="score-sep"> : </span>
        <b>{game.awayScore ?? '–'}</b> {awayHe}
      </span>
      {game.isLive && <span className="live-badge">LIVE</span>}
      {game.statusText && !game.isLive && (
        <span className="game-date">{game.statusText}</span>
      )}
    </div>
  );
}

/* ── Main modal ── */
export default function SeriesStatsModal({ series, onClose }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updateTime, setUpdateTime] = useState(null);
  const [tab,        setTab]        = useState('points'); // points | rebounds | assists

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/series/${series._id}/stats`);
      const d   = await res.json();
      setData(d);
      setUpdateTime(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [series._id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/series/${series._id}/refresh-stats`, {
        method: 'POST', credentials: 'include',
      });
      const d = await res.json();
      setData((prev) => ({ ...prev, playerStats: d.playerStats, games: d.games }));
      setUpdateTime(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const timeStr = (d) => d
    ? d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : '';

  const aW = data?.teamAWins ?? series.teamAWins ?? 0;
  const bW = data?.teamBWins ?? series.teamBWins ?? 0;
  const leader = aW > bW ? data?.teamA : bW > aW ? data?.teamB : null;

  const stats = data?.playerStats || [];

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="stats-header">
          <button className="close-x" onClick={onClose}>✕</button>
          <div className="header-logos">
            <TeamLogo teamName={series.teamA} className="header-logo" />
            <div className="header-center">
              <div className="header-teams">{series.teamA} – {series.teamB}</div>
              <div className="header-record">
                <span className={aW > bW ? 'wins leading' : 'wins'}>{aW}</span>
                <span className="rec-dash"> – </span>
                <span className={bW > aW ? 'wins leading' : 'wins'}>{bW}</span>
              </div>
              {leader && <div className="header-leader">{leader} מובילה</div>}
              {data?.round && <div className="header-round">{data.round}</div>}
            </div>
            <TeamLogo teamName={series.teamB} className="header-logo" />
          </div>
        </div>

        {loading ? (
          <p className="loading-txt">טוען נתונים...</p>
        ) : (
          <>
            {/* ── Games ── */}
            {data?.games?.length > 0 && (
              <div className="games-section">
                <h4>תוצאות משחקים</h4>
                {data.games.map((g, i) => (
                  <GameRow key={g.id || i} game={g} index={i}
                    teamAName={series.teamA} teamBName={series.teamB} />
                ))}
              </div>
            )}

            {/* ── Stats tabs ── */}
            {stats.length > 0 ? (
              <div className="stats-section">
                <h4>סטטיסטיקות שחקנים בסדרה</h4>
                <div className="tabs">
                  <button className={tab === 'points'   ? 'active' : ''} onClick={() => setTab('points')}>🏀 נקודות</button>
                  <button className={tab === 'rebounds' ? 'active' : ''} onClick={() => setTab('rebounds')}>💪 ריבאונד</button>
                  <button className={tab === 'assists'  ? 'active' : ''} onClick={() => setTab('assists')}>🎯 אסיסטים</button>
                </div>
                {tab === 'points'   && <StatCategory title="מלך הנקודות"  players={stats} statKey="points"   statLabel="נק'" />}
                {tab === 'rebounds' && <StatCategory title="מלך הריבאונד" players={stats} statKey="rebounds" statLabel="ריב'" />}
                {tab === 'assists'  && <StatCategory title="מלך האסיסטים" players={stats} statKey="assists"  statLabel="עזר" />}
              </div>
            ) : (
              <p className="no-stats">
                אין נתוני שחקנים עדיין — המשחק טרם התחיל או שהנתונים טרם עודכנו.
                <br />לחץ "רענן" לנסות לשלוף מ-ESPN.
              </p>
            )}
          </>
        )}

        {/* ── Footer ── */}
        <div className="stats-footer">
          {updateTime && <span className="update-time">עודכן: {timeStr(updateTime)}</span>}
          <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing || loading}>
            {refreshing ? 'מרענן...' : '⟳ רענן'}
          </button>
        </div>
      </div>
    </div>
  );
}
