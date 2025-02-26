import React, { useState, useEffect } from 'react';
import PlaceBetModal from './PlaceBetModal';
import CountdownClock from '../../components/CountdownClock';
import TeamLogo from '../../components/TeamLogo';
import { FaCheckCircle } from 'react-icons/fa';
import Background from '../../components/Login-back';
import './HomePage.scss';

function HomePage() {
  const [seriesList, setSeriesList] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [showBetModal, setShowBetModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  useEffect(() => {
    fetchUnlockedSeries();
    fetchUserBets();
  }, []);

  // Show only isLocked === false
  const fetchUnlockedSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series');
      const data = await res.json();
      const unlocked = data.filter((s) => !s.isLocked);
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

  const findUserBet = (seriesId) =>
    userBets.find((b) => b.seriesId && b.seriesId._id === seriesId) || null;

  // Instead of an overlay, we show the bet panel inline
  const openBetModal = (series) => {
    setCurrentSeries(series);
    setShowBetModal(true);
  };

  const onModalSave = () => {
    setShowBetModal(false);
    fetchUserBets();
  };

  return (
    <div className="home-page">
      <Background image="background.png" />

      <div className="series-list">
        <h2 className="bets">הימורים</h2>
        {seriesList.length === 0 && <p>אין סדרות פתוחות כרגע.</p>}

        {seriesList.map((s) => {
          const bet = findUserBet(s._id);
          const hasBet = !!bet;

          // Countdown logic
          let countdownElem = null;
          if (s.startDate) {
            const now = new Date();
            if (new Date(s.startDate) > now) {
              countdownElem = <CountdownClock startDate={s.startDate} />;
            }
          }

          return (
            <div
              key={s._id}
              className={`series-card ${hasBet ? 'has-bet' : 'no-bet'}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSeries(s);
                setShowBetModal(true);
              }}
            >
              <div className="series-header" style={{ cursor: 'pointer' }}>
                <div
                  className="left-logos"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBetModal(s);
                  }}
                >
                  <TeamLogo teamName={s.teamA} className="big-logo" />
                  <TeamLogo teamName={s.teamB} className="big-logo" />
                </div>

                <div
                  className="right-column"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBetModal(s);
                  }}
                >
                  <div>{hasBet && <FaCheckCircle className="check-icon" />}</div>
                  <div className="top-line">
                    <span style={{ opacity: 0.75 }}>סיום הימור בעוד</span>
                  </div>
                  {hasBet && <span className="bet-confirmed">הימור בוצע</span>}
                  {!hasBet && <div className="countdown-line">{countdownElem}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline extension for the current series if showBetModal === true */}
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
