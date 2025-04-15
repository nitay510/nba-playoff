import React, { useState, useEffect, useRef } from 'react';
import { useNavigate }        from 'react-router-dom';
import CountdownClock         from '../../components/CountdownClock';
import TeamLogo               from '../../components/TeamLogo';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import Background             from '../../components/Login-back';
import Header                 from '../../components/Header';
import './HomePage.scss';

export default function HomePage() {
  const navigate = useNavigate();

  /* redirect guest → login */
  useEffect(() => {
    if (!localStorage.getItem('username')) navigate('/', { replace: true });
  }, [navigate]);

  /* ───────── state ───────── */
  const [myInfo,     setMyInfo]     = useState({ username: '', points: 0, champion: '' });
  const [seriesList, setSeriesList] = useState([]);
  const [userBets,   setUserBets]   = useState([]);
  const [openCards,  setOpenCards]  = useState({});
  const [localBets,  setLocalBets]  = useState({});

  /* ───────── invite code ───────── */
  const inviteRef = useRef(localStorage.getItem('pendingLeague'));

  useEffect(() => {
    if (!myInfo.username || !inviteRef.current) return;
    (async () => {
      try {
        await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/join', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inviteRef.current }),
        });
      } finally {
        localStorage.removeItem('pendingLeague');
        inviteRef.current = null;
      }
    })();
  }, [myInfo.username]);

  /* initial fetches */
  useEffect(() => {
    fetchMyUserInfo();
    fetchUnlockedSeries();
    fetchUserBets();
  }, []);

  /* helpers */
  const formatOdds = (v) => (Number.isFinite(+v) ? (+v).toFixed(1) : v);

  const fetchMyUserInfo = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;
    try {
      const r = await fetch('https://nba-playoff-eyd5.onrender.com/api/auth/me', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!r.ok) return;
      const d = await r.json();
      setMyInfo({ username: d.username || '', points: d.points || 0, champion: d.champion || '' });
    } catch (e) { console.error(e); }
  };

  const fetchUnlockedSeries = async () => {
    try {
      const r = await fetch('https://nba-playoff-eyd5.onrender.com/api/series');
      const d = await r.json();
      setSeriesList(
        d.filter((s) => !s.isLocked)
         .sort((a, b) => new Date(a.startDate || 1e15) - new Date(b.startDate || 1e15))
      );
    } catch (e) { console.error(e); }
  };

  const fetchUserBets = async () => {
    try {
      const r = await fetch('https://nba-playoff-eyd5.onrender.com/api/user-bets',
                            { credentials: 'include' });
      const d = await r.json();
      setUserBets(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
  };

  /* betting helpers (unchanged) */
  const findDoc = (id) => userBets.find((b) => b.seriesId?._id === id) || null;
  const numStr  = (s='') => (s.match(/\d+/) || [null])[0];

  const openCard  = (id) => {
    setOpenCards((p) => ({ ...p, [id]: true }));
    setLocalBets((p) => ({ ...p, [id]: findDoc(id)?.bets || [] }));
  };
  const closeCard = (id) => setOpenCards((p) => ({ ...p, [id]: false }));

  const syncGames = (sid, bets) => {
    const w = bets.find((b) => b.category === 'מנצחת הסדרה');
    const g = bets.find((b) => b.category === 'בכמה משחקים');
    if (!w || !g) return bets;
    const n = numStr(g.choiceName);
    return n ? bets.map((b)=>
      b.category==='בכמה משחקים'?{...b,choiceName:`${w.choiceName} ב${n}`}:b
    ):bets;
  };

  const select = (sid, cat, choice) => {
    const prev = localBets[sid] || [];
    const idx  = prev.findIndex((b)=>b.category===cat);
    const upd  = idx===-1
      ? [...prev,{category:cat,choiceName:choice.name,oddsWhenPlaced:choice.odds}]
      : prev.map((b,i)=>i===idx?{...b,choiceName:choice.name,oddsWhenPlaced:choice.odds}:b);
    setLocalBets((p)=>({...p,[sid]:syncGames(sid,upd)}));
  };

  const isSel = (sid,cat,name)=>{
    const b=(localBets[sid]||[]).find((x)=>x.category===cat);
    if(!b) return false;
    if(cat==='מנצחת הסדרה') return b.choiceName===name;
    if(cat==='בכמה משחקים') return numStr(b.choiceName)===numStr(name);
    return b.choiceName===name;
  };

  const saveBet = async (sid)=>{
    try{
      await fetch(`https://nba-playoff-eyd5.onrender.com/api/user-bets/${sid}`,{
        method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({bets:localBets[sid]||[]})
      });
      await fetchUserBets();
      closeCard(sid);
    }catch(e){console.error(e);}
  };

  const cd = (d)=>d&&new Date(d)>new Date()?<CountdownClock startDate={d}/> : null;

  /* ───────── UI ───────── */
  return (
    <div className="home-page">
      <Header />
      <Background image="background.png" />

      <div className="page-con">
        {/* info bar */}
        <div className="info-bar">
          <div className="info-item"><small>שם משתמש</small><p>{myInfo.username}</p></div>
          <div className="info-item"><small>הניקוד שלי</small><p>{myInfo.points}</p></div>
          <div className="info-item">
            <small>האלופה שלי</small>
            {myInfo.champion ? (
              <p>{myInfo.champion}</p>
            ) : (
              <button className="choose-champ-btn" onClick={()=>navigate('/choose-champion')}>
                בחר אלופה
              </button>
            )}
          </div>
        </div>

        <div className="series-list">
          <h2 className="bets">דף הבית</h2>
          {seriesList.length===0 && <p style={{marginRight:'2rem'}}>אין סדרות פתוחות כרגע.</p>}

          {seriesList.map((s)=> {
            const hasBet = !!findDoc(s._id);
            const isOpen = !!openCards[s._id];

            return (
              <div key={s._id} className={`series-card ${hasBet?'has-bet':'no-bet'}`}>
                {/* collapsed */}
                {!isOpen && (
                  <div className="series-header" style={{cursor:'pointer'}} onClick={()=>openCard(s._id)}>
                    <div className="left-logos">
                      <TeamLogo teamName={s.teamA} className="big-logo"/>
                      <TeamLogo teamName={s.teamB} className="big-logo"/>
                    </div>
                    <div className="right-column">
                      {hasBet && <FaCheckCircle className="check-icon"/>}
                      <div className="top-line"><span style={{opacity:.75}}>סיום ניחוש בעוד</span></div>
                      {hasBet ? <span className="bet-confirmed">ניחוש בוצע</span>
                               : <div className="countdown-line">{cd(s.startDate)}</div>}
                    </div>
                  </div>
                )}

                {/* expanded */}
                {isOpen && (
                  <div className="place-bet-inline">
                    <div className="top-bar">
                      <div className="top-bar-center">
                        <span style={{opacity:.75}}>סיום ניחוש בעוד</span>
                        <div className="countdown-text">{cd(s.startDate)}</div>
                      </div>
                      <FaTimes className="close-icon" onClick={()=>closeCard(s._id)}/>
                    </div>

                    <div className="teams-row">
                      <TeamLogo teamName={s.teamA} className="team-logo"/>
                      <span className="teams-dash">-</span>
                      <TeamLogo teamName={s.teamB} className="team-logo"/>
                    </div>

                    <div className="bet-options">
                      {s.betOptions.map((opt,i)=>(
                        <div key={i} className="bet-category">
                          <h5>{opt.category==='מנצחת הסדרה'?'מנצחת הסדרה (יחס)':opt.category}</h5>
                          <div className="pill-container">
                            {opt.choices.map((c,j)=>{
                              const sel = isSel(s._id,opt.category,c.name);
                              const txt = opt.category==='מנצחת הסדרה'
                                ? `${c.name} (${formatOdds(c.odds)})`
                                : c.name;
                              return (
                                <div key={j} className={`pill ${sel?'selected':''}`}
                                     onClick={()=>select(s._id,opt.category,c)}>
                                  {txt}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="modal-actions">
                      <button className="primary-btn" onClick={()=>saveBet(s._id)}>שמור</button>
                      <button className="cancel-btn"  onClick={()=>closeCard(s._id)}>בטל</button>
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
