import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LeaderboardPage.scss';

function LeaderboardPage() {
  const { leagueId } = useParams(); // from /leagues/:leagueId/leaderboard
  const [leagueName, setLeagueName] = useState('');
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
      setLeagueName(data.leagueName);
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
      <h2>טבלת ניקוד - ליגה: {leagueName}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {members.length === 0 ? (
        <p>אין משתמשים להצגה בליגה זו.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>נקודות</th>
            </tr>
          </thead>
          <tbody>
            {members.map((u) => (
              <tr key={u._id} onClick={() => handleUserClick(u.username)}>
                <td>{u.username}</td>
                <td>{u.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaderboardPage;
