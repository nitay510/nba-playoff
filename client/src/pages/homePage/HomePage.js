import React, { useState, useEffect, useRef } from 'react';
import { useNavigate }     from 'react-router-dom';
import CountdownClock      from '../../components/CountdownClock';
import TeamLogo            from '../../components/TeamLogo';
import { FaCheckCircle, FaTimes, FaBell } from 'react-icons/fa';
import Background          from '../../components/Login-back';
import Header              from '../../components/Header';
import SeriesStatsModal    from './SeriesStatsModal';
import { isPushSupported, registerPushNotifications } from '../../utils/pushNotifications';
import './HomePage.scss';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('username')) navigate('/', { replace: true });
  }, [navigate]);

  const [myInfo,     setMyInfo]     = useState({ username: '', points: 0, champion: '' });
  const [seriesList, setSeriesList] = useState([]);
  const [userBets,   setUserBets]   = useState([]);
  const [openCards,  setOpenCards]  = useState({});
  const [localBets,  setLocalBets]  = useState({});
  const [statsSeries, setStatsSeries] = useState(null); // series to show stats for
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [pushLoading,    setPushLoading]    = useState(false);

  /* join league from invite link */
  const inviteRef = useRef(localStorage.getItem('pendingLeague'));
  useEffect(() => {
    if (!myInfo.username || !inviteRef.current) return;
    (async () => {
      try {
        await fetch('/api/leagues/join', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inviteRef.current }),
        });
      } finally {
        localStorage.removeItem('pendingLeague');
        inviteRef.current = null;
      }
    })();
  }, [myInfo.username]);

  useEffect(() => {
    fetchMyUserInfo();
    fetchAllActiveSeries();
    fetchUserBets();
  }, []);

  /* Show push-permission banner once per browser if not yet asked */
  useEffect(() => {
    if (!isPushSupported()) return;
    if (localStorage.getItem('pushAsked')) return;
    if (Notification.permission === 'granted') {
      // Already granted on another visit — silently re-subscribe
      registerPushNotifications().catch(() => {});
      return;
    }
    if (Notification.permission === 'denied') return;
    setShowPushBanner(true);
  }, []);

  const handleAllowPush = async () => {
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await registerPushNotifications();
      }
    } catch (e) {
      console.error('Push registration failed:', e);
    } finally {
      localStorage.setItem('pushAsked', '1');
      setShowPushBanner(false);
      setPushLoading(false);
    }
  };

  const handleDismissPush = () => {
    localStorage.setItem('pushAsked', '1');
    setShowPushBanner(false);
  };

  const formatOdds = (v) => (Number.isFinite(+v) ? (+v).toFixed(1) : v);

  const fetchMyUserInfo = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;
    try {
      const r = await fetch('/api/auth/me', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!r.ok) return;
      const d = await r.json();
      setMyInfo({ username: d.username || '', points: d.points || 0, champion: d.champion || '' });
    } catch (e) { console.error(e); }
  };

  /* Fetch all non-finished series (locked AND unlocked) */
  const fetchAllActiveSeries = async () => {
    try {
      const r = await fetch('/api/series');
      const d = await r.json();
      setSeriesList(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
  };

  const fetchUserBets = async () => {
    try {
      const r = await fetch('/api/user-bets', { credentials: 'include' });
      const d = await r.json();
      setUserBets(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
  };

  const findDoc  = (id) => userBets.find((b) => b.seriesId?._id === id) || null;
  const numStr   = (s = '') => (s.match(/\d+/) || [null])[0];

  const openCard  = (id) => {
    setOpenCards((p) => ({ ...p, [id]: true }));
    setLocalBets((p) => ({ ...p, [id]: findDoc(id)?.bets || [] }));
  };
  const closeCard = (id) => setOpenCards((p) => ({ ...p, [id]: false }));

  const syncGames = (sid, b) => {
    const w = b.find((x) => x.category === 'מנצחת הסדרה');
    const g = b.find((x) => x.category === 'בכמה משחקים');
    if (!w || !g) return b;
    const n = numStr(g.choiceName);
    return n ? b.map((x) => x.category === 'בכמה משחקים' ? { ...x, choiceName: `${w.choiceName} ב${n}` } : x) : b;
  };

  const select = (sid, cat, ch) => {
    const prev = localBets[sid] || [];
    const idx  = prev.findIndex((x) => x.category === cat);
    const upd  = idx === -1
      ? [...prev, { category: cat, choiceName: ch.name, oddsWhenPlaced: ch.odds }]
      : prev.map((x, i) => i === idx ? { ...x, choiceName: ch.name, oddsWhenPlaced: ch.odds } : x);
    setLocalBets((p) => ({ ...p, [sid]: syncGames(sid, upd) }));
  };

  const isSel = (sid, cat, name) => {
    const b = (localBets[sid] || []).find((x) => x.category === cat);
    if (!b) return false;
    if (cat === 'מנצחת הסדרה') return b.choiceName === name;
    if (cat === 'בכמה משחקים') return numStr(b.choiceName) === numStr(name);
    return b.choiceName === name;
  };

  const saveBet = async (sid) => {
    try {
      await fetch(`/api/user-bets/${sid}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets: localBets[sid] || [] }),
      });
      await fetchUserBets();
      closeCard(sid);
    } catch (e) { console.error(e); }
  };

  const cd = (d) => d && new Date(d) > new Date() ? <CountdownClock startDate={d} /> : null;

  /* Series score display */
  const SeriesScore = ({ s }) => {
    const aW = s.teamAWins ?? 0;
    const bW = s.teamBWins ?? 0;
    if (aW === 0 && bW === 0) return null;
    const leader = aW > bW ? s.teamA : bW > aW ? s.teamB : null;
    return (
      <div className="series-score">
        <span className="score-num">{aW}</span>
        <span className="score-dash">–</span>
        <span className="score-num">{bW}</span>
        {leader && <span className="score-leader">({leader} מובילה)</span>}
      </div>
    );
  };

  /* Sort: unlocked (open for betting) first, then by startDate */
  const activeSeries = seriesList.filter((s) => !s.isFinished);
  const orderedSeries = [...activeSeries].sort((a, b) => {
    if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1;
    const aBet = !!findDoc(a._id);
    const bBet = !!findDoc(b._id);
    if (!a.isLocked && aBet !== bBet) return aBet ? 1 : -1;
    return new Date(a.startDate || 1e15) - new Date(b.startDate || 1e15);
  });

  const openBetting    = orderedSeries.filter((s) => !s.isLocked);
  const activeLocked   = orderedSeries.filter((s) => s.isLocked);
  const finishedSeries = [...seriesList]
    .filter((s) => s.isFinished)
    .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));

  /* For finished series: check if a user bet choice matches the final answer */
  const betResult = (myBet, series) => {
    if (!myBet) return null;
    return myBet.bets.map((b) => {
      const opt = series.betOptions?.find((o) => o.category === b.category);
      const hasFinal = !!opt?.finalChoice;
      const correct  = hasFinal && opt.finalChoice === b.choiceName;
      return { ...b, hasFinal, correct };
    });
  };

  const canChangeChampion = new Date() < new Date('2026-04-19T17:30:00Z'); // button hidden after April 19 20:30 Israel time

  return (
    <div className="home-page">
      <Header />
      <Background image="background.png" />

      {/* Push-notification permission banner */}
      {showPushBanner && (
        <div className="push-banner">
          <FaBell className="push-banner__icon" />
          <span className="push-banner__text">
            רוצה תזכורת לפני כל סדרה?
          </span>
          <button
            className="push-banner__allow"
            onClick={handleAllowPush}
            disabled={pushLoading}
          >
            {pushLoading ? '...' : 'אפשר התראות'}
          </button>
          <button className="push-banner__dismiss" onClick={handleDismissPush}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="page-con">
        {/* info bar */}
        <div className="info-bar">
          <div className="info-item"><small>שם משתמש</small><p>{myInfo.username}</p></div>
          <div className="info-item"><small>הניקוד שלי</small><p>{myInfo.points}</p></div>
          <div className="info-item">
            <small>האלופה שלי</small>
            <p>{myInfo.champion || 'לא נבחרה'}</p>
            {canChangeChampion && (
              <button className="change-champion-btn" onClick={() => navigate('/choose-champion')}>
                שנה בחירה
              </button>
            )}
          </div>
        </div>

        {/* ── Open for betting ── */}
        <div className="series-list">
          <h2 className="bets">ניחושים פתוחים</h2>
          {openBetting.length === 0 && (
            <p style={{ marginRight: '2rem', opacity: 0.7 }}>אין סדרות פתוחות לניחוש כרגע.</p>
          )}

          {openBetting.map((s) => {
            const hasBet = !!findDoc(s._id);
            const isOpen = !!openCards[s._id];

            return (
              <div key={s._id} className={`series-card ${hasBet ? 'has-bet' : 'no-bet'}`}>
                {!isOpen && (
                  <div className="series-header" style={{ cursor: 'pointer' }} onClick={() => openCard(s._id)}>
                    <div className="left-logos">
                      <TeamLogo teamName={s.teamA} className="big-logo" />
                      <TeamLogo teamName={s.teamB} className="big-logo" />
                    </div>
                    <div className="right-column">
                      {hasBet && <FaCheckCircle className="check-icon" />}
                      <div className="top-line"><span style={{ opacity: .75 }}>סיום ניחוש בעוד</span></div>
                      {hasBet
                        ? <span className="bet-confirmed">ניחוש בוצע</span>
                        : <div className="countdown-line">{cd(s.startDate)}</div>}
                    </div>
                  </div>
                )}

                {isOpen && (
                  <div className="place-bet-inline">
                    <div className="top-bar">
                      <div className="top-bar-center">
                        <span style={{ opacity: .75 }}>סיום ניחוש בעוד</span>
                        <div className="countdown-text">{cd(s.startDate)}</div>
                      </div>
                      <FaTimes className="close-icon" onClick={() => closeCard(s._id)} />
                    </div>

                    <div className="teams-row">
                      <TeamLogo teamName={s.teamA} className="team-logo" />
                      <span className="teams-dash">-</span>
                      <TeamLogo teamName={s.teamB} className="team-logo" />
                    </div>

                    <div className="bet-options">
                      {s.betOptions.map((opt, i) => (
                        <div key={i} className="bet-category">
                          <h5>{opt.category === 'מנצחת הסדרה' ? 'מנצחת הסדרה (יחס)' : opt.category}</h5>
                          <div className="pill-container">
                            {opt.choices.map((c, j) => {
                              const sel = isSel(s._id, opt.category, c.name);
                              const txt = opt.category === 'מנצחת הסדרה'
                                ? `${c.name} (${formatOdds(c.odds)})`
                                : c.name;
                              return (
                                <div key={j} className={`pill ${sel ? 'selected' : ''}`}
                                  onClick={() => select(s._id, opt.category, c)}>{txt}</div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="modal-actions">
                      <button className="primary-btn" onClick={() => saveBet(s._id)}>שמור</button>
                      <button className="cancel-btn" onClick={() => closeCard(s._id)}>בטל</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Active locked series (score tracker) ── */}
        {activeLocked.length > 0 && (
          <div className="series-list live-section">
            <h2 className="bets">סדרות פעילות 🏀</h2>
            {activeLocked.map((s) => {
              const myBet = findDoc(s._id);
              return (
                <div key={s._id} className="series-card locked-card">
                  <div className="locked-header">
                    <TeamLogo teamName={s.teamA} className="big-logo" />
                    <div className="locked-center">
                      <div className="locked-names">{s.teamA} – {s.teamB}</div>
                      <SeriesScore s={s} />
                      {s.round && <div className="round-label">{s.round}</div>}
                    </div>
                    <TeamLogo teamName={s.teamB} className="big-logo" />
                  </div>

                  {myBet && (
                    <div className="my-locked-bet">
                      <strong>הניחוש שלי:</strong>
                      {myBet.bets.map((b, i) => (
                        <span key={i} className="locked-bet-pill">
                          {b.category}: <b>{b.choiceName}</b> ×{(+b.oddsWhenPlaced).toFixed(1)}
                        </span>
                      ))}
                    </div>
                  )}

                  <button className="stats-btn" onClick={() => setStatsSeries(s)}>
                    📊 סטטיסטיקות
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Finished series ── */}
        {finishedSeries.length > 0 && (
          <div className="series-list finished-section">
            <h2 className="bets">סדרות שהסתיימו ✅</h2>
            {finishedSeries.map((s) => {
              const myBet = findDoc(s._id);
              const results = betResult(myBet, s);
              const aW = s.teamAWins ?? 0;
              const bW = s.teamBWins ?? 0;
              const winner = aW > bW ? s.teamA : bW > aW ? s.teamB : null;
              return (
                <div key={s._id} className="series-card finished-card">
                  <div className="locked-header">
                    <TeamLogo teamName={s.teamA} className={`big-logo ${aW > bW ? 'winner-logo' : 'loser-logo'}`} />
                    <div className="locked-center">
                      <div className="locked-names">{s.teamA} – {s.teamB}</div>
                      <div className="finished-score">
                        <span className={aW > bW ? 'wins leading' : 'wins'}>{aW}</span>
                        <span className="rec-dash"> – </span>
                        <span className={bW > aW ? 'wins leading' : 'wins'}>{bW}</span>
                      </div>
                      {winner && <div className="winner-label">🏆 {winner}</div>}
                      {s.round && <div className="round-label">{s.round}</div>}
                    </div>
                    <TeamLogo teamName={s.teamB} className={`big-logo ${bW > aW ? 'winner-logo' : 'loser-logo'}`} />
                  </div>

                  {results && (
                    <div className="my-locked-bet">
                      <strong>הניחוש שלי:</strong>
                      {results.map((b, i) => (
                        <span
                          key={i}
                          className={`locked-bet-pill ${b.hasFinal ? (b.correct ? 'bet-correct' : 'bet-wrong') : ''}`}
                        >
                          {b.category}: <b>{b.choiceName}</b>
                          {b.hasFinal && <span className="bet-verdict">{b.correct ? ' ✓' : ' ✗'}</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  <button className="stats-btn" onClick={() => setStatsSeries(s)}>
                    📊 סטטיסטיקות
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {statsSeries && (
        <SeriesStatsModal
          series={statsSeries}
          onClose={() => setStatsSeries(null)}
        />
      )}
    </div>
  );
}
