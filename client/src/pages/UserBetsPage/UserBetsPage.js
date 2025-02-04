import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './UserBetsPage.scss';

function UserBetsPage() {
  const { username } = useParams(); // from /user-bets/:username
  const [bets, setBets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserBets();
  }, [username]);

  const fetchUserBets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user-bets/user/${username}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to fetch user bets');
      }
      const data = await res.json();
      setBets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Filter only finished series
  const finishedBets = bets.filter((ub) => ub.seriesId && ub.seriesId.isFinished);

  return (
    <div className="user-bets-page container">
      <h2>הימורים של משתמש {username} (סדרות שהסתיימו)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {finishedBets.length === 0 ? (
        <p>אין הימורים על סדרות שהסתיימו.</p>
      ) : (
        finishedBets.map((ub) => {
          const series = ub.seriesId;
          return (
            <div key={ub._id} className="bet-card">
              <h3>{series.teamA} נגד {series.teamB}</h3>
              <ul>
                {ub.bets.map((b, idx) => {
                  const cat = series.betOptions.find((o) => o.category === b.category);
                  const finalChoice = cat?.finalChoice || 'לא נקבע';
                  const isCorrect = finalChoice === b.choiceName;

                  return (
                    <li key={idx}>
                      <strong>{b.category}</strong> - {b.choiceName} (יחס: {b.oddsWhenPlaced})
                      {' '}
                      <em>תוצאה סופית: {finalChoice}</em>
                      {isCorrect ? <span style={{ color: 'green' }}> ✅ </span> : <span style={{ color: 'red' }}> ❌ </span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}

export default UserBetsPage;
