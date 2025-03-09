import React, { useState, useEffect } from 'react';
import CountdownClock from '../../components/CountdownClock';
import TeamLogo from '../../components/TeamLogo';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import Background from '../../components/Login-back';
import Header from '../../components/Header';
import './HomePage.scss';

function HomePage() {
  const [seriesList, setSeriesList] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [openCards, setOpenCards] = useState({});
  const [localBets, setLocalBets] = useState({});

  useEffect(() => {
    fetchUnlockedSeries();
    fetchUserBets();
  }, []);

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

  const findUserBetDoc = (seriesId) =>
    userBets.find((b) => b.seriesId && b.seriesId._id === seriesId) || null;

  const openCard = (seriesId) => {
    setOpenCards((prev) => ({ ...prev, [seriesId]: true }));
    const userBetDoc = findUserBetDoc(seriesId);
    if (userBetDoc) {
      setLocalBets((prev) => ({ ...prev, [seriesId]: userBetDoc.bets }));
    } else {
      setLocalBets((prev) => ({ ...prev, [seriesId]: [] }));
    }
  };

  const closeCard = (seriesId) => {
    setOpenCards((prev) => ({ ...prev, [seriesId]: false }));
  };

  // parse numeric for 'בכמה משחקים'
  const parseGamesNumber = (str = '') => {
    const match = str.match(/\d+/);
    return match ? match[0] : null;
  };

  const syncGamesPick = (seriesId, updatedBets) => {
    const winnerBet = updatedBets.find((b) => b.category === 'מנצחת הסדרה');
    const gamesBet = updatedBets.find((b) => b.category === 'בכמה משחקים');
    if (!winnerBet || !gamesBet) return updatedBets;

    const numericStr = parseGamesNumber(gamesBet.choiceName);
    if (!numericStr) return updatedBets;

    if (winnerBet.choiceName) {
      const combined = `${winnerBet.choiceName} ב${numericStr}`;
      return updatedBets.map((b) =>
        b.category === 'בכמה משחקים' ? { ...b, choiceName: combined } : b
      );
    }
    return updatedBets;
  };

  const handleChoiceSelect = (seriesId, category, choice) => {
    const prevBets = localBets[seriesId] || [];
    const idx = prevBets.findIndex((b) => b.category === category);

    let updated = [...prevBets];
    if (idx === -1) {
      updated.push({
        category,
        choiceName: choice.name,
        oddsWhenPlaced: choice.odds,
      });
    } else {
      updated[idx] = {
        category,
        choiceName: choice.name,
        oddsWhenPlaced: choice.odds,
      };
    }
    updated = syncGamesPick(seriesId, updated);
    setLocalBets((prev) => ({ ...prev, [seriesId]: updated }));
  };

  const isChoiceSelected = (seriesId, category, choiceName) => {
    const bets = localBets[seriesId] || [];
    const bet = bets.find((b) => b.category === category);
    if (!bet) return false;

    if (category === 'מנצחת הסדרה') {
      return bet.choiceName === choiceName;
    }
    if (category === 'בכמה משחקים') {
      const betNum = parseGamesNumber(bet.choiceName);
      const cNum = parseGamesNumber(choiceName);
      return betNum && cNum && betNum === cNum;
    }
    return bet.choiceName === choiceName;
  };

  const handleSaveBet = async (seriesId) => {
    try {
      const currentBetArr = localBets[seriesId] || [];
      await fetch(`http://localhost:5000/api/user-bets/${seriesId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets: currentBetArr }),
      });
      await fetchUserBets();
      closeCard(seriesId);
    } catch (error) {
      console.error(error);
    }
  };

  const getCountdownElem = (startDate) => {
    if (startDate) {
      const now = new Date();
      if (new Date(startDate) > now) {
        return <CountdownClock startDate={startDate} />;
      }
    }
    return null;
  };

  return (
    <div className="home-page">
      <Header />
      <Background image="background.png" />

      <div className="series-list">
        <h2 className="bets">דף הבית</h2>
        {seriesList.length === 0 && <p>אין סדרות פתוחות כרגע.</p>}

        {seriesList.map((s) => {
          const betDoc = findUserBetDoc(s._id);
          const hasBet = !!betDoc;

          const isOpen = !!openCards[s._id];
          const countdownElem = getCountdownElem(s.startDate);

          return (
            <div
              key={s._id}
              className={`series-card ${hasBet ? 'has-bet' : 'no-bet'}`}
            >
              {!isOpen && (
                <div
                  className="series-header"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openCard(s._id)}
                >
                  <div className="left-logos">
                    <TeamLogo teamName={s.teamA} className="big-logo" />
                    <TeamLogo teamName={s.teamB} className="big-logo" />
                  </div>

                  <div className="right-column">
                    {hasBet && <FaCheckCircle className="check-icon" />}
                    <div className="top-line">
                      <span style={{ opacity: 0.75 }}>סיום הימור בעוד</span>
                    </div>
                    {hasBet ? (
                      <span className="bet-confirmed">הימור בוצע</span>
                    ) : (
                      <div className="countdown-line">{countdownElem}</div>
                    )}
                  </div>
                </div>
              )}

              {isOpen && (
                <div className="place-bet-inline">
                  <div className="top-bar">
                    <div className="top-bar-center">
                      <span style={{ opacity: 0.75 }}>סיום הימור בעוד</span>
                      <div className="countdown-text">{countdownElem}</div>
                    </div>
                    <FaTimes
                      className="close-icon"
                      onClick={() => closeCard(s._id)}
                    />
                  </div>

                  <div className="teams-row">
                    <TeamLogo teamName={s.teamA} className="team-logo" />
                    <span className="teams-dash">-</span>
                    <TeamLogo teamName={s.teamB} className="team-logo" />
                  </div>

                  <div className="bet-options">
                    {s.betOptions.map((opt, i) => (
                      <div key={i} className="bet-category">
                        <h5>{opt.category}</h5>
                        <div className="pill-container">
                          {opt.choices.map((c, j) => {
                            const selected = isChoiceSelected(s._id, opt.category, c.name);
                            
                            // NEW: If category == "מנצחת הסדרה", show odds in parentheses
                            const displayName = 
                              opt.category === 'מנצחת הסדרה'
                                ? `${c.name} (${c.odds})`
                                : c.name;
                            
                            return (
                              <div
                                key={j}
                                className={`pill ${selected ? 'selected' : ''}`}
                                onClick={() => handleChoiceSelect(s._id, opt.category, c)}
                              >
                                {displayName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="modal-actions">
                    <button
                      className="primary-btn"
                      onClick={() => handleSaveBet(s._id)}
                    >
                      שמור
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => closeCard(s._id)}
                    >
                      בטל
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HomePage;
