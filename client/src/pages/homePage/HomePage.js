import React, { useState, useEffect, useRef } from 'react';
import CountdownClock   from '../../components/CountdownClock';
import TeamLogo         from '../../components/TeamLogo';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import Background       from '../../components/Login-back';
import Header           from '../../components/Header';
import './HomePage.scss';

function HomePage() {
  /* ───────── state ───────── */
  const [myInfo,     setMyInfo]     = useState({ username: '', points: 0, champion: '' });
  const [seriesList, setSeriesList] = useState([]);
  const [userBets,   setUserBets]   = useState([]);
  const [openCards,  setOpenCards]  = useState({});
  const [localBets,  setLocalBets]  = useState({});

  /* ───────── invite handling ───────── */
  const inviteRef = useRef(localStorage.getItem('pendingLeague')); // null or code

  /* once username known – attempt join league */
  useEffect(() => {
    if (!myInfo.username || !inviteRef.current) return;

    (async () => {
      try {
        await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/join', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username:   myInfo.username,
            leagueCode: inviteRef.current,   // 01c1d0
          }),
        });
        localStorage.removeItem('pendingLeague');
        inviteRef.current = null;            // joined → clear flag
      } catch {
        /* ignore, will retry next visit */
      }
    })();
  }, [myInfo.username]);

  /* ───────── lifecycle ───────── */
  useEffect(() => {
    fetchMyUserInfo();
    fetchUnlockedSeries();
    fetchUserBets();
  }, []);

  /* ───────── helpers ───────── */

  const formatOdds = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n.toFixed(1) : val;
  };

  const fetchMyUserInfo = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) return;

      const res  = await fetch('https://nba-playoff-eyd5.onrender.com/api/auth/me', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMyInfo({
        username: data.username || '',
        points:   data.points   || 0,
        champion: data.champion || '',
      });
    } catch (err) { console.error(err); }
  };

  const fetchUnlockedSeries = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/series');
      const data = await res.json();
      const unlockedSorted = data
        .filter((s) => !s.isLocked)
        .sort((a, b) => new Date(a.startDate || 1e15) - new Date(b.startDate || 1e15));
      setSeriesList(unlockedSorted);
    } catch (err) { console.error(err); }
  };

  const fetchUserBets = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/user-bets', {
        credentials: 'include',
      });
      const data = await res.json();
      setUserBets(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  /* ───────── betting helpers (unchanged) ───────── */
  const findUserBetDoc = (id) =>
    userBets.find((b) => b.seriesId && b.seriesId._id === id) || null;

  const parseGamesNumber = (str='') => (str.match(/\d+/) || [null])[0];

  const openCard  = (id) => {
    setOpenCards((p) => ({ ...p, [id]: true }));
    const doc = findUserBetDoc(id);
    setLocalBets((p) => ({ ...p, [id]: doc ? doc.bets : [] }));
  };
  const closeCard = (id) => setOpenCards((p) => ({ ...p, [id]: false }));

  const syncGamesPick = (seriesId, bets) => {
    const win = bets.find((b) => b.category === 'מנצחת הסדרה');
    const gm  = bets.find((b) => b.category === 'בכמה משחקים');
    if (!win || !gm) return bets;
    const num = parseGamesNumber(gm.choiceName);
    if (!num) return bets;
    return bets.map((b) =>
      b.category === 'בכמה משחקים'
        ? { ...b, choiceName: `${win.choiceName} ב${num}` }
        : b
    );
  };

  const handleChoiceSelect = (seriesId, category, choice) => {
    const prev = localBets[seriesId] || [];
    const idx  = prev.findIndex((b) => b.category === category);

    const updated =
      idx === -1
        ? [...prev, { category, choiceName: choice.name, oddsWhenPlaced: choice.odds }]
        : prev.map((b, i) =>
            i === idx ? { ...b, choiceName: choice.name, oddsWhenPlaced: choice.odds } : b
          );

    setLocalBets((p) => ({ ...p, [seriesId]: syncGamesPick(seriesId, updated) }));
  };

  const isChoiceSelected = (seriesId, category, name) => {
    const bet = (localBets[seriesId] || []).find((b) => b.category === category);
    if (!bet) return false;
    if (category === 'מנצחת הסדרה') return bet.choiceName === name;
    if (category === 'בכמה משחקים')
      return parseGamesNumber(bet.choiceName) === parseGamesNumber(name);
    return bet.choiceName === name;
  };

  const handleSaveBet = async (seriesId) => {
    try {
      await fetch(`https://nba-playoff-eyd5.onrender.com/api/user-bets/${seriesId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets: localBets[seriesId] || [] }),
      });
      await fetchUserBets();
      closeCard(seriesId);
    } catch (err) { console.error(err); }
  };

  const countdownElem = (startDate) =>
    startDate && new Date(startDate) > new Date()
      ? <CountdownClock startDate={startDate} />
      : null;

  /* ───────── render ───────── */
  return (
    <div className="home-page">
      <Header />
      <Background image="background.png" />

      <div className="page-con">
        {/* info bar */}
        <div className="info-bar">
          <div className="info-item"><small>שם משתמש</small><p>{myInfo.username}</p></div>
          <div className="info-item"><small>הניקוד שלי</small><p>{myInfo.points}</p></div>
          <div className="info-item"><small>האלופה שלי</small><p>{myInfo.champion || '---'}</p></div>
        </div>

        <div className="series-list">
          <h2 className="bets">דף הבית</h2>
          {seriesList.length === 0 && (
            <p style={{ marginRight: '2rem' }}>אין סדרות פתוחות כרגע.</p>
          )}

          {seriesList.map((s) => {
            const hasBet = !!findUserBetDoc(s._id);
            const isOpen = !!openCards[s._id];

            return (
              <div
                key={s._id}
                className={`series-card ${hasBet ? 'has-bet' : 'no-bet'}`}
              >
                {/* collapsed */}
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
                        <span style={{ opacity: 0.75 }}>סיום ניחוש בעוד</span>
                      </div>
                      {hasBet ? (
                        <span className="bet-confirmed">ניחוש בוצע</span>
                      ) : (
                        <div className="countdown-line">
                          {countdownElem(s.startDate)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* expanded */}
                {isOpen && (
                  <div className="place-bet-inline">
                    <div className="top-bar">
                      <div className="top-bar-center">
                        <span style={{ opacity: 0.75 }}>סיום ניחוש בעוד</span>
                        <div className="countdown-text">
                          {countdownElem(s.startDate)}
                        </div>
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
                          <h5>
                            {opt.category === 'מנצחת הסדרה'
                              ? 'מנצחת הסדרה (יחס)'
                              : opt.category}
                          </h5>

                          <div className="pill-container">
                            {opt.choices.map((c, j) => {
                              const selected = isChoiceSelected(
                                s._id,
                                opt.category,
                                c.name
                              );
                              const display =
                                opt.category === 'מנצחת הסדרה'
                                  ? `${c.name} (${formatOdds(c.odds)})`
                                  : c.name;

                              return (
                                <div
                                  key={j}
                                  className={`pill ${selected ? 'selected' : ''}`}
                                  onClick={() =>
                                    handleChoiceSelect(
                                      s._id,
                                      opt.category,
                                      c
                                    )
                                  }
                                >
                                  {display}
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
