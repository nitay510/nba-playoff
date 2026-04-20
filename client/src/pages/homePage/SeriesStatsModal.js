import React, { useState, useEffect, useCallback } from 'react';
import TeamLogo from '../../components/TeamLogo';
import { transliterateToHebrew } from '../../utils/transliterate';
import './SeriesStatsModal.scss';

/* ── Top-N players sorted by a stat key ── */
function StatCategory({ players, statKey, statLabel, gamesPlayed }) {
  const sorted = [...players]
    .filter((p) => p[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey])
    .slice(0, 7);

  if (!sorted.length) return null;

  return (
    <div className="stat-cat">
      {gamesPlayed > 0 && (
        <div className="stat-context">סה"כ בסדרה · {gamesPlayed} משחקים</div>
      )}
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
function GameRow({ game, index }) {
  const { homeWon, awayWon } = game;

  return (
    <div className={`game-row ${game.isLive ? 'is-live' : ''} ${game.isCompleted ? 'is-done' : ''}`}>
      <span className="game-num">מ{index + 1}</span>
      <span className="game-teams">
        <span className={homeWon ? 'team-winner' : ''}>{game.homeTeam || '–'}</span>
        <span className="vs-sep"> נגד </span>
        <span className={awayWon ? 'team-winner' : ''}>{game.awayTeam || '–'}</span>
      </span>
      <span className="game-score-nums">
        <span className={homeWon ? 'score-winner' : 'score-dim'}>{game.homeScore ?? '–'}</span>
        <span className="score-colon">:</span>
        <span className={awayWon ? 'score-winner' : 'score-dim'}>{game.awayScore ?? '–'}</span>
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
  const [tab,        setTab]        = useState('points');

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
  const teamA = data?.teamA || series.teamA;
  const teamB = data?.teamB || series.teamB;
  const leader = aW > bW ? teamA : bW > aW ? teamB : null;
  const isFinished = series.isFinished;

  const stats = data?.playerStats || [];
  const games = data?.games || [];
  const gamesPlayed = games.filter((g) => g.isCompleted).length;

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="stats-header">
          <button className="close-x" onClick={onClose}>✕</button>
          <div className="header-logos">
            <div className="header-team-col">
              <TeamLogo teamName={series.teamA} className={`header-logo ${aW > bW ? 'logo-leading' : bW > aW ? 'logo-trailing' : ''}`} />
              <span className="header-team-name">{series.teamA}</span>
            </div>

            <div className="header-center">
              {(data?.round || series.round) && (
                <div className="header-round">{data?.round || series.round}</div>
              )}
              <div className="header-record">
                <span className={`wins${aW > bW ? ' leading' : ''}`}>{aW}</span>
                <span className="rec-dash"> – </span>
                <span className={`wins${bW > aW ? ' leading' : ''}`}>{bW}</span>
              </div>
              {isFinished && leader ? (
                <div className="header-status finished">🏆 {leader} ניצחה</div>
              ) : leader ? (
                <div className="header-status leading">{leader} מובילה</div>
              ) : aW > 0 ? (
                <div className="header-status tied">שוויון</div>
              ) : (
                <div className="header-status not-started">טרם שוחק</div>
              )}
              {gamesPlayed > 0 && (
                <div className="header-games-count">{gamesPlayed} משחקים מ-7</div>
              )}
            </div>

            <div className="header-team-col">
              <TeamLogo teamName={series.teamB} className={`header-logo ${bW > aW ? 'logo-leading' : aW > bW ? 'logo-trailing' : ''}`} />
              <span className="header-team-name">{series.teamB}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="loading-txt">טוען נתונים...</p>
        ) : (
          <>
            {/* ── Games ── */}
            {games.length > 0 && (
              <div className="games-section">
                <h4>תוצאות משחקים</h4>
                {games.map((g, i) => (
                  <GameRow key={g.id || i} game={g} index={i} />
                ))}
              </div>
            )}

            {/* ── Stats tabs ── */}
            {stats.length > 0 ? (
              <div className="stats-section">
                <h4>סטטיסטיקות שחקנים — סה"כ בסדרה</h4>
                <div className="tabs">
                  <button className={tab === 'points'   ? 'active' : ''} onClick={() => setTab('points')}>🏀 נקודות</button>
                  <button className={tab === 'rebounds' ? 'active' : ''} onClick={() => setTab('rebounds')}>💪 ריבאונד</button>
                  <button className={tab === 'assists'  ? 'active' : ''} onClick={() => setTab('assists')}>🎯 אסיסטים</button>
                </div>
                {tab === 'points'   && <StatCategory players={stats} statKey="points"   statLabel="נק'"  gamesPlayed={gamesPlayed} />}
                {tab === 'rebounds' && <StatCategory players={stats} statKey="rebounds" statLabel="ריב'" gamesPlayed={gamesPlayed} />}
                {tab === 'assists'  && <StatCategory players={stats} statKey="assists"  statLabel="עזר"  gamesPlayed={gamesPlayed} />}
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
