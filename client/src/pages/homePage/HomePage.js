import React, { useState, useEffect } from 'react';
import PlaceBetModal from './PlaceBetModal';
import './HomePage.scss';

function HomePage() {
  const [seriesList, setSeriesList] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [showBetModal, setShowBetModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  useEffect(() => {
    fetchSeries();
    fetchUserBets();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series');
      const data = await res.json();
      setSeriesList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserBets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user-bets', {
        credentials: 'include',
      });
      const data = await res.json();
      setUserBets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Safely find the user's bet for a given series
  const findUserBet = (seriesId) => {
    return userBets.find((b) => b.seriesId && b.seriesId._id === seriesId) || null;
  };

  const openBetModal = (series) => {
    setCurrentSeries(series);
    setShowBetModal(true);
  };

  const onModalSave = () => {
    setShowBetModal(false);
    fetchUserBets();
  };

  // Filter out finished series
  const ongoingSeries = seriesList.filter((s) => !s.isFinished);

  return (
    <div className="home-page container">
      <h2>הימורי פלייאוף - ברוך הבא!</h2>
      <div className="series-list">
        {ongoingSeries.length === 0 && <p>אין סדרות פעילות כרגע.</p>}

        {ongoingSeries.map((s) => {
          const bet = findUserBet(s._id);
          return (
            <div key={s._id} className="series-card">
              <h3>{s.teamA} נגד {s.teamB}</h3>
              <p>נעול? {s.isLocked ? 'כן' : 'לא'}</p>

              {bet ? (
                <div className="user-bet">
                  <p>ההימורים שלך:</p>
                  <ul>
                    {bet.bets.map((b) => (
                      <li key={b.category}>
                        <strong>{b.category}</strong>: {b.choiceName} (יחס: {b.oddsWhenPlaced})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>אין הימור עדיין.</p>
              )}

              {!s.isLocked && (
                <button className="primary-btn" onClick={() => openBetModal(s)}>
                  {bet ? 'ערוך הימור' : 'הימר עכשיו'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showBetModal && currentSeries && (
        <PlaceBetModal
          series={currentSeries}
          userBet={findUserBet(currentSeries._id)}
          onClose={() => setShowBetModal(false)}
          onSave={onModalSave}
        />
      )}
    </div>
  );
}

export default HomePage;
