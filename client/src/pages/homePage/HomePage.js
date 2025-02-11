// client/src/pages/homePage/HomePage.js
import React, { useState, useEffect } from 'react';
import PlaceBetModal from './PlaceBetModal';
import CountdownClock from '../../components/CountdownClock';
import './HomePage.scss';

function HomePage() {
  const [seriesList, setSeriesList] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [showBetModal, setShowBetModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  // track expanded state for each series
  const [expanded, setExpanded] = useState({}); // { [seriesId]: bool }

  useEffect(() => {
    fetchUnlockedSeries();
    fetchUserBets();
  }, []);

  // 1) Show only unlocked => isLocked === false
  const fetchUnlockedSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series');
      const data = await res.json();
      const unlocked = data.filter((s) => s.isLocked === false);
      setSeriesList(unlocked);
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

  const findUserBet = (seriesId) => {
    return (
      userBets.find((b) => b.seriesId && b.seriesId._id === seriesId) || null
    );
  };

  const openBetModal = (series) => {
    setCurrentSeries(series);
    setShowBetModal(true);
  };

  const onModalSave = () => {
    setShowBetModal(false);
    fetchUserBets(); // refresh bets
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="home-page container">
      <h2>הימורי פלייאוף - ללא נעילה</h2>
      <div className="series-list">
        {seriesList.length === 0 && <p>אין סדרות פתוחות כרגע.</p>}

        {seriesList.map((s) => {
          const bet = findUserBet(s._id);

          // If we have a future startDate, show countdown
          let countdownElem = null;
          if (s.startDate) {
            const now = new Date();
            if (new Date(s.startDate) > now) {
              countdownElem = <CountdownClock startDate={s.startDate} />;
            }
          }

          return (
            <div key={s._id} className="series-card">
              <div className="series-header">
                <h3>{s.teamA} נגד {s.teamB}</h3>
                {/* Show countdown if any */}
                {countdownElem && (
                  <div className="countdown-wrapper">
                    <span>מתחיל בעוד: </span>{countdownElem}
                  </div>
                )}
              </div>

              <div className="action-row">
                {/* If it's unlocked, let user bet */}
                <button className="primary-btn" onClick={() => openBetModal(s)}>
                  {bet ? 'ערוך הימור' : 'הימר עכשיו'}
                </button>

                <button className="expand-btn" onClick={() => toggleExpand(s._id)}>
                  {expanded[s._id] ? 'הסתר פירוט' : 'הצג פירוט'}
                </button>
              </div>

              {expanded[s._id] && (
                <div className="expanded-bets">
                  {bet ? (
                    <div className="user-bet">
                      <p>ההימורים שלך:</p>
                      <ul>
                        {bet.bets.map((b) => (
                          <li key={b.category}>
                            <strong>{b.category}</strong>:
                            {' '}{b.choiceName} (יחס: {b.oddsWhenPlaced})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>אין הימור עדיין.</p>
                  )}
                  <p>
                    תאריך התחלה: 
                    {s.startDate
                      ? new Date(s.startDate).toLocaleString('he-IL')
                      : '---'}
                  </p>
                </div>
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
