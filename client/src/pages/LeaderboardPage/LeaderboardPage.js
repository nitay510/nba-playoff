import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaderboardPage.scss';

function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth', {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to fetch users');
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // When user clicks on a row => navigate to /user-bets/:username
  const handleUserClick = (username) => {
    console.log(username);
    navigate(`/user-bets/${username}`);
  };

  return (
    <div className="leaderboard-page container">
      <h2>טבלת ניקוד</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {users.length === 0 ? (
        <p>אין משתמשים להצגה.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>נקודות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
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
