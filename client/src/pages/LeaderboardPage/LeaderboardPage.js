import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from '../../components/Login-back';
import Header from '../../components/Header';
import './LeaderboardPage.scss';

function LeaderboardPage() {
  const { leagueId } = useParams();
  const navigate     = useNavigate();

  const [leagueName, setLeagueName] = useState('');
  const [leagueCode, setLeagueCode] = useState('');
  const [members,    setMembers]    = useState([]);
  const [error,      setError]      = useState('');

  /* username from localStorage – לזיהוי השורה שלי */
  const myUsername = localStorage.getItem('username');

  useEffect(() => { fetchLeagueLeaderboard(); }, [leagueId]);

  const fetchLeagueLeaderboard = async () => {
    try {
      const r = await fetch(
        `https://nba-playoff-eyd5.onrender.com/api/leagues/${leagueId}/leaderboard`,
        { credentials: 'include' }
      );
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
          <span className="arrow-right" onClick={() => navigate('/leagues')}>
            &lt;
          </span>
          <h2 className="league-title">{leagueName}</h2>
          {leagueCode && <div className="league-code">{leagueCode} : קוד</div>}
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {members.length === 0 ? (
          <p>אין משתמשים להצגה בליגה זו.</p>
        ) : (
          <div className="leaderboard-list">
            {members.map((u, idx) => (
              <div
                key={u._id}
                className="leaderboard-item"
                onClick={() => handleUserClick(u.username)}
                style={
                  u.username === myUsername
                    ? { background: '#fff8' }   /* ← הדגשת השורה שלי */
                    : {}
                }
              >
                <span className="rank">{idx + 1}</span>
                <span className="username">{u.username}</span>
                <span className="points-label">{u.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;
