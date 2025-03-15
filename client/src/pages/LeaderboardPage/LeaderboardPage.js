import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from '../../components/Login-back';
import './LeaderboardPage.scss';
import Header from '../../components/Header';

function LeaderboardPage() {
  const { leagueId } = useParams(); 
  const [leagueName, setLeagueName] = useState('');
  const [leagueCode, setLeagueCode] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeagueLeaderboard();
  }, [leagueId]);

  const fetchLeagueLeaderboard = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/leagues/${leagueId}/leaderboard`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Failed to fetch league leaderboard');
      }
      setLeagueName(data.leagueName || '');
      setLeagueCode(data.leagueCode || '');
      setMembers(data.leaderboard || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/user-bets/${username}`);
  };

  return (
    <div className="league-leaderboard-page container">
      <Background image="background3.png" />
      <Header/>
      <div className= "page-con">
      <div className="leaderboard-header">
      <span className="arrow-right" onClick={() => navigate('/leagues')}>
          &lt;
        </span>
        <h2 className="league-title">{leagueName}</h2>

        {/* Show code if available */}
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
