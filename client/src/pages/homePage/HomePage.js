import React, { useState, useEffect } from 'react';
import CountdownClock from '../../components/CountdownClock';
import TeamLogo from '../../components/TeamLogo';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import Background from '../../components/Login-back';
import Header from '../../components/Header';
import './HomePage.scss';

function HomePage() {
  // Store user info (username, points, champion)
  const [myInfo, setMyInfo] = useState({
    username: '',
    points: 0,
    champion: '',
  });

  const [seriesList, setSeriesList] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [openCards, setOpenCards] = useState({});
  const [localBets, setLocalBets] = useState({});

  // On mount, fetch user info and series/bets
  useEffect(() => {
    fetchMyUserInfo();
    fetchUnlockedSeries();
    fetchUserBets();
  }, []);

  // 1) Fetch user info using POST /api/auth/me with { username } from localStorage
  const fetchMyUserInfo = async () => {
    try {
      const storedUser = localStorage.getItem('username'); 
      if (!storedUser) {
        // If there's no username in localStorage, maybe skip
        return;
      }

      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/auth/me', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: storedUser }),
      });
      if (!res.ok) {
        // user not found or server error
        return;
      }
      const data = await res.json(); // { username, points, champion }
      setMyInfo({
        username: data.username || '',
        points: data.points || 0,
        champion: data.champion || '',
      });
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  // 2) Fetch unlocked series
  const fetchUnlockedSeries = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/series');
      const data = await res.json();
      const unlocked = data.filter((s) => !s.isLocked);
      setSeriesList(unlocked);
    } catch (error) {
      console.error(error);
    }
  };

  // 3) Fetch user bets
  const fetchUserBets = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/user-bets', {
        credentials: 'include',
      });
      const data = await res.json();
      setUserBets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Find if user has a bet doc for given series
  const findUserBetDoc = (seriesId) =>
    userBets.find((b) => b.seriesId && b.seriesId._id === seriesId) || null;

  // Expand a series card
  const openCard = (seriesId) => {
    setOpenCards((prev) => ({ ...prev, [seriesId]: true }));
    const userBetDoc = findUserBetDoc(seriesId);
    if (userBetDoc) {
      setLocalBets((prev) => ({ ...prev, [seriesId]: userBetDoc.bets }));
    } else {
      setLocalBets((prev) => ({ ...prev, [seriesId]: [] }));
    }
  };

  // Collapse a series card
  const closeCard = (seriesId) => {
    setOpenCards((prev) => ({ ...prev, [seriesId]: false }));
  };

  // Helper for "בכמה משחקים" logic
  const parseGamesNumber = (str = '') => {
    const match = str.match(/\d+/);
    return match ? match[0] : null;
  };

  // Sync "בכמה משחקים" + "מנצחת הסדרה"
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

  // On choosing a pill
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

  // Save bet => post to server => refresh => close
  const handleSaveBet = async (seriesId) => {
    try {
      const currentBetArr = localBets[seriesId] || [];
      await fetch(`https://nba-playoff-eyd5.onrender.com/api/user-bets/${seriesId}`, {
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

  // Countdown display
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

      <div className="page-con">
      <div className="info-bar">
  <div className="info-item">
    <small>שם משתמש</small>
    <p>{myInfo.username}</p>
  </div>

  <div className="info-item">
    <small>הנקוד שלי</small>
    <p>{myInfo.points}</p>
  </div>

  <div className="info-item">
    <small>האלופה שלי</small>
    <p>{myInfo.champion || '---'}</p>
  </div>
</div>

        <div className="series-list">
          <h2 className="bets">דף הבית</h2>
          {seriesList.length === 0 && <p style={{marginRight:'2rem'}}>אין סדרות פתוחות כרגע.</p>}

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
                {/* Collapsed */}
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

                {/* Expanded */}
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
                              const selected = isChoiceSelected(
                                s._id,
                                opt.category,
                                c.name
                              );

                              // If category == "מנצחת הסדרה", show odds in parentheses
                              const displayName =
                                opt.category === 'מנצחת הסדרה'
                                  ? `${c.name} (${c.odds})`
                                  : c.name;

                              return (
                                <div
                                  key={j}
                                  className={`pill ${selected ? 'selected' : ''}`}
                                  onClick={() =>
                                    handleChoiceSelect(s._id, opt.category, c)
                                  }
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
    </div>
  );
}

export default HomePage;
