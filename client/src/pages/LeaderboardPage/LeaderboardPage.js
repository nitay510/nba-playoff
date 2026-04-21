import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from '../../components/Login-back';
import Header from '../../components/Header';
import TeamLogo from '../../components/TeamLogo';
import './LeaderboardPage.scss';

const COLORS = ['#4299e1','#48bb78','#f6ad55','#9f7aea','#fc8181','#4fd1c5','#63b3ed','#68d391'];

function DonutChart({ choices, totalVotes }) {
  const r = 36, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  let cumulativeFraction = 0;

  return (
    <svg viewBox="0 0 100 100" className="donut-svg">
      {choices.map((choice, i) => {
        const fraction = totalVotes > 0 ? choice.count / totalVotes : 0;
        const sliceLen = fraction * circumference;
        const startAngle = cumulativeFraction * 360 - 90;
        cumulativeFraction += fraction;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={14}
            strokeDasharray={`${sliceLen} ${circumference - sliceLen}`}
            transform={`rotate(${startAngle} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r="28" fill="#0e1428" />
      <text x={cx} y={cy - 3} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">{totalVotes}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6">הימרו</text>
    </svg>
  );
}

function BetsBreakdownTab({ leagueId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`/api/leagues/${leagueId}/bets-breakdown`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [leagueId]);

  if (loading) return <p className="breakdown-loading">טוען נתונים...</p>;
  if (error)   return <p className="breakdown-error">{error}</p>;
  if (!data?.length) return <p className="breakdown-empty">אין סדרות פעילות נעולות כרגע.</p>;

  return (
    <div className="breakdown-list">
      {data.map((series) => (
        <div key={series.seriesId} className="breakdown-series-card">
          <div className="breakdown-series-header">
            <TeamLogo teamName={series.teamA} className="breakdown-logo" />
            <div className="breakdown-series-info">
              <div className="breakdown-series-names">{series.teamA} נגד {series.teamB}</div>
              <div className="breakdown-series-record">
                <span className={series.teamAWins > series.teamBWins ? 'winning' : ''}>{series.teamAWins}</span>
                <span className="dash"> – </span>
                <span className={series.teamBWins > series.teamAWins ? 'winning' : ''}>{series.teamBWins}</span>
              </div>
              <div className="breakdown-bettors">{series.totalBettors} / {series.totalMembers} הימרו</div>
            </div>
            <TeamLogo teamName={series.teamB} className="breakdown-logo" />
          </div>

          {series.categories.map((cat) => (
            <div key={cat.category} className="breakdown-category">
              <div className="breakdown-cat-title">{cat.category}</div>
              <div className="breakdown-cat-body">
                <DonutChart choices={cat.choices} totalVotes={cat.totalVotes} />
                <div className="breakdown-legend">
                  {cat.choices.map((c, i) => (
                    <div key={c.name} className="legend-row">
                      <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="legend-name">{c.name}</span>
                      <span className="legend-count">{c.count}</span>
                      <span className="legend-pct">{Math.round((c.count / cat.totalVotes) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function LeaderboardPage() {
  const { leagueId } = useParams();
  const navigate     = useNavigate();

  const [leagueName, setLeagueName] = useState('');
  const [leagueCode, setLeagueCode] = useState('');
  const [members,    setMembers]    = useState([]);
  const [error,      setError]      = useState('');
  const [tab,        setTab]        = useState('leaderboard');

  const myUsername = localStorage.getItem('username');

  useEffect(() => { fetchLeagueLeaderboard(); }, [leagueId]);

  const fetchLeagueLeaderboard = async () => {
    try {
      const r = await fetch(`/api/leagues/${leagueId}/leaderboard`, { credentials: 'include' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.msg || 'Failed to fetch leaderboard');
      setLeagueName(d.leagueName || '');
      setLeagueCode(d.leagueCode || '');
      setMembers(d.leaderboard || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const handleUserClick = (username) => navigate(`/user-bets/${username}`);

  return (
    <div className="league-leaderboard-page container">
      <Background image="background3.png" />
      <Header />

      <div className="page-con">
        <div className="leaderboard-header">
          <span className="arrow-right" onClick={() => navigate('/leagues')}>&lt;</span>
          <h2 className="league-title">{leagueName}</h2>
          {leagueCode && <div className="league-code">{leagueCode} : קוד</div>}
        </div>

        <div className="lb-tabs">
          <button className={tab === 'leaderboard' ? 'active' : ''} onClick={() => setTab('leaderboard')}>טבלה</button>
          <button className={tab === 'bets' ? 'active' : ''} onClick={() => setTab('bets')}>ניחושים</button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {tab === 'leaderboard' && (
          members.length === 0 ? (
            <p className="no-members">אין משתמשים להצגה בליגה זו.</p>
          ) : (
            <div className="leaderboard-list">
              {members.map((u, idx) => (
                <div
                  key={u._id}
                  className="leaderboard-item"
                  onClick={() => handleUserClick(u.username)}
                  style={u.username === myUsername ? { background: '#fff8' } : {}}
                >
                  <span className="rank">{idx + 1}</span>
                  <span className="username">{u.username}</span>
                  <span className="points-label">{u.points}</span>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'bets' && <BetsBreakdownTab leagueId={leagueId} />}
      </div>
    </div>
  );
}

export default LeaderboardPage;
