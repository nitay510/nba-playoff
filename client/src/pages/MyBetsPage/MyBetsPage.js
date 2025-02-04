import React, { useEffect, useState } from 'react';
import './MyBetsPage.scss'; // optional styling

function MyBetsPage() {
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState('');

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

  // Filter only finished series
  const finishedBets = userBets.filter((ub) => {
    return ub.seriesId && ub.seriesId.isFinished;
  });

  return (
    <div className="my-bets-page container">
      <h2>ההימורים שלי (סדרות שהסתיימו)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {finishedBets.length === 0 ? (
        <p>אין הימורים על סדרות שהסתיימו.</p>
      ) : (
        finishedBets.map((ub) => {
          const series = ub.seriesId; 
          // We'll show each bet and the final result
          return (
            <div key={ub._id} className="bet-card">
              <h3>{series.teamA} נגד {series.teamB}</h3>
              <p>הסתיים? {series.isFinished ? 'כן' : 'לא'}</p>
              
              <p>ההימורים שלך:</p>
              <ul>
                {ub.bets.map((b, idx) => {
                  // find the finalChoice for this category
                  const cat = series.betOptions.find((o) => o.category === b.category);
                  const finalChoice = cat?.finalChoice || 'לא נקבע';
                  const isCorrect = finalChoice === b.choiceName;

                  return (
                    <li key={idx}>
                      <strong>{b.category}</strong> - {b.choiceName} (יחס: {b.oddsWhenPlaced})
                      <br />
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

export default MyBetsPage;
