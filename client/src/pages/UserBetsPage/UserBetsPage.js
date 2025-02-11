// client/src/pages/UserBetsPage/UserBetsPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calculateSeriesPoints } from '../../utils/points';
import './UserBetsPage.scss';

function UserBetsPage() {
  const { username } = useParams();
  const [bets, setBets] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

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

  // Only locked series => isLocked = true
  const lockedBets = bets.filter((ub) => ub.seriesId && ub.seriesId.isLocked);

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  return (
    <div className="user-bets-page container">
      <h2>הימורים של משתמש {username} (סדרות נעולות)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {lockedBets.length === 0 ? (
        <p>אין הימורים על סדרות נעולות.</p>
      ) : (
        lockedBets.map((ub) => {
          const series = ub.seriesId;
          const points = calculateSeriesPoints(ub, series);
          const isExpanded = !!expanded[ub._id];

          return (
            <div key={ub._id} className="bet-card">
              <div className="bet-summary">
                <h3>{series.teamA} נגד {series.teamB}</h3>
                <p>נקודות בסדרה זו: {points}</p>
                <button className="expand-btn" onClick={() => toggleExpand(ub._id)}>
                  {isExpanded ? 'הסתר פירוט' : 'הצג פירוט'}
                </button>
              </div>

              {isExpanded && (
                <div className="bet-details">
                  <ul>
                    {ub.bets.map((b, idx) => {
                      const cat = series.betOptions.find((o) => o.category === b.category);
                      const finalChoice = cat?.finalChoice || null;
                      const isCorrect = finalChoice && finalChoice === b.choiceName;

                      return (
                        <li key={idx}>
                          <strong>{b.category}</strong> - {b.choiceName} (יחס: {b.oddsWhenPlaced})
                          {series.isFinished && cat ? (
                            <>
                              <br />
                              תוצאה סופית: {cat.finalChoice || '---'}
                              {isCorrect ? (
                                <span style={{ color: 'green' }}> ✅</span>
                              ) : (
                                <span style={{ color: 'red' }}> ❌</span>
                              )}
                            </>
                          ) : (
                            <>
                            <br />
                            <span>לא התקבלה תוצאה סופית</span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default UserBetsPage;
