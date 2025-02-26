import React, { useEffect, useState } from 'react';
import { calculateSeriesPoints } from '../../utils/points';
import './MyBetsPage.scss';
import Background from '../../components/Login-back';
import TeamLogo from '../../components/TeamLogo';

function MyBetsPage() {
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [activePage, setActivePage] = useState('active');

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

  // Separate active and finished bets
  const activeBets = userBets.filter((ub) => ub.seriesId && !ub.seriesId.isFinished && ub.seriesId.isLocked);
  const finishedBets = userBets.filter((ub) => ub.seriesId && ub.seriesId.isFinished && ub.seriesId.isLocked);

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  return (
    <div className="my-bets-page container">
      <Background image="background2.png" />
      <h2>ההימורים שלי</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button onClick={() => setActivePage('active')} className={activePage === 'active' ? 'active' : ''}>
          פעילים
        </button>
        <button onClick={() => setActivePage('history')} className={activePage === 'history' ? 'active' : ''}>
          היסטוריה
        </button>
      </div>

      {/* Show Active Bets */}
      {activePage === 'active' && (
        <>
          {activeBets.length === 0 ? (
            <p>אין הימורים פעילים.</p>
          ) : (
            activeBets.map((ub) => {
              const series = ub.seriesId;
              const points = calculateSeriesPoints(ub, series);
              const isExpanded = !!expanded[ub._id];

              return (
                <div key={ub._id} className="bet-card" onClick={() => toggleExpand(ub._id)}>
                  <div className="bet-summary">
                    <span>סטטוס ההימור</span>
                    <strong>הימור פעיל</strong>
                  </div>

                  <div className="team-logos">
                    <TeamLogo teamName={series.teamA} />
                    <TeamLogo teamName={series.teamB} />
                  </div>

                  {isExpanded && (
                    <div className="bet-details">
                      <ul>
                        {ub.bets.map((b, idx) => (
                          <li key={idx}>
                            <strong>{b.category}</strong> - {b.choiceName} (יחס: {b.oddsWhenPlaced})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {/* Show Finished Bets (History) */}
      {activePage === 'history' && (
        <>
          {finishedBets.length === 0 ? (
            <p>אין הימורים היסטוריים.</p>
          ) : (
            finishedBets.map((ub) => {
              const series = ub.seriesId;
              const points = calculateSeriesPoints(ub, series);
              const isExpanded = !!expanded[ub._id];

              return (
                <div key={ub._id} className="bet-card" onClick={() => toggleExpand(ub._id)}>
                  <div className="bet-summary">
                    <span>סטטוס ההימור</span>
                    <span className='activeOrNot'>הימור הסתיים</span>
                  </div>

                  <div className="team-logos">
                    <TeamLogo teamName={series.teamA} />
                    <TeamLogo teamName={series.teamB} />
                  </div>

                  {isExpanded && (
                    <div className="bet-details">
                      <ul>
                        {ub.bets.map((b, idx) => (
                          <li key={idx}>
                            <strong>{b.category}</strong> - {b.choiceName} (יחס: {b.oddsWhenPlaced})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

export default MyBetsPage;
