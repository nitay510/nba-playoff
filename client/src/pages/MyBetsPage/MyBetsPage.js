// client/src/pages/MyBetsPage/MyBetsPage.js
import React, { useEffect, useState } from 'react';
import { calculateSeriesPoints } from '../../utils/points';  // import
import './MyBetsPage.scss';

function MyBetsPage() {
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchAllUserBets();
  }, []);

  const fetchAllUserBets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user-bets/all', {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to fetch user bets');
      }
      const data = await res.json();
      setUserBets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // show only locked (isLocked = true) series
  const lockedBets = userBets.filter((ub) => ub.seriesId && ub.seriesId.isLocked);

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  return (
    <div className="my-bets-page container">
      <h2>ההימורים שלי (סדרות נעולות)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {lockedBets.length === 0 ? (
        <p>אין הימורים על סדרות נעולות.</p>
      ) : (
        lockedBets.map((ub) => {
          const series = ub.seriesId;
          // compute total points if series is finished
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

export default MyBetsPage;
