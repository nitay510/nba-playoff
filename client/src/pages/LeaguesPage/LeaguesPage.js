import React, { useEffect, useState } from 'react';
import { FaSearch }      from 'react-icons/fa';
import { useNavigate }   from 'react-router-dom';
import Background        from '../../components/Login-back';
import Header            from '../../components/Header';
import './LeaguesPage.scss';

function LeaguesPage() {
  const navigate = useNavigate();

  const [leagues,   setLeagues]   = useState([]);
  const [myRanks,   setMyRanks]   = useState({});   // { leagueId : {rank,total} }

  /* inline create / join state (unchanged) */
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leagueName,     setLeagueName]     = useState('');
  const [showJoinForm,   setShowJoinForm]   = useState(false);
  const [joinCode,       setJoinCode]       = useState('');
  const [codeValid,      setCodeValid]      = useState(false);

  /* ───────── initial fetch ───────── */
  useEffect(() => { fetchMyLeagues(); }, []);

  const fetchMyLeagues = async () => {
    try {
      const res  = await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/mine',
                               { credentials: 'include' });
      const data = await res.json();
      setLeagues(data);

      /* fetch rank for each league in parallel */
      const rankPromises = data.map(async (lg) => {
        try {
          const r = await fetch(
            `https://nba-playoff-eyd5.onrender.com/api/leagues/${lg._id}/my-rank`,
            { credentials: 'include' }
          );
          if (!r.ok) throw new Error('no rank');
          const d = await r.json();          // { rank , total }
          return { id: lg._id, rank: d.rank, total: d.total };
        } catch {
          return { id: lg._id, rank: null,   total: lg.members.length };
        }
      });

      const ranksArr = await Promise.all(rankPromises);
      const ranksObj = ranksArr.reduce((acc, cur) => {
        acc[cur.id] = { rank: cur.rank, total: cur.total };
        return acc;
      }, {});
      setMyRanks(ranksObj);

    } catch (err) { console.error('Error fetching leagues:', err); }
  };

  /* create league (unchanged) */
  const handleCreateLeague = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/create', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leagueName }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.msg || 'Failed');
      alert(`ליגה נוצרה! קוד: ${data.code}`);
      setLeagueName(''); setShowCreateForm(false); fetchMyLeagues();
    } catch (e) { console.error(e); }
  };

  /* join league (unchanged) */
  const handleJoinLeague = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/join', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.msg || 'Failed');
      alert(`הצטרפת לליגה: ${data.name}`);
      setJoinCode(''); setCodeValid(false); setShowJoinForm(false); fetchMyLeagues();
    } catch (e) { console.error(e); }
  };

  const onChangeJoinCode = (v) => { setJoinCode(v); setCodeValid(v.length === 6); };

  /* ───────── UI ───────── */
  return (
    <div className="leagues-page container">
      <Background image="background3.png" />
      <Header />

      <div className="page-con">
        <h2>הליגות שלי</h2>

        <div className="league-list">
          {leagues.map((lg) => {
            const rankInfo = myRanks[lg._id] || {};
            const placeTxt = rankInfo.rank
              ? `מקום ${rankInfo.rank} מתוך ${rankInfo.total}`
              : `${rankInfo.total || lg.members.length} משתתפים`;

            return (
              <div key={lg._id} className="league-card"
                   onClick={() => navigate(`/leagues/${lg._id}/leaderboard`)}>
                <h3>{lg.name}</h3>
                <p>{placeTxt}</p>
              </div>
            );
          })}
        </div>

        {/* create league inline (unchanged) */}
        <div className="create-league-inline">
          {!showCreateForm ? (
            <div className="create-condensed" onClick={()=>setShowCreateForm(true)}>
              <span className="create-text">צור ליגה חדשה</span>
              <span className="plus-icon">+</span>
            </div>
          ) : (
            <div className="create-expanded">
              <div className="header-row" onClick={()=>setShowCreateForm(false)}>
                <h3>צור ליגה חדשה</h3><span className="plus-icon">+</span>
              </div>
              <label className="league-label">שם הליגה</label>
              <input className="league-input" value={leagueName}
                     onChange={(e)=>setLeagueName(e.target.value)}/>
              <button className="create-btn" onClick={handleCreateLeague}>צור</button>
            </div>
          )}
        </div>

        {/* join league inline (unchanged) */}
        <div className="join-league-inline">
          {!showJoinForm ? (
            <div className="join-condensed" onClick={()=>setShowJoinForm(true)}>
              <span className="join-text">הצטרף לליגה קיימת</span>
              <span className="search-icon"><FaSearch/></span>
            </div>
          ) : (
            <div className="join-expanded">
              <div className="header-row-join" onClick={()=>setShowJoinForm(false)}>
                <h3>הצטרף לליגה קיימת</h3>
                <span className="search-icon"><FaSearch/></span>
              </div>
              <div className="join-row">
                <div className="code-input-wrapper">
                  <input className="code-input" placeholder="548276"
                         value={joinCode} onChange={(e)=>onChangeJoinCode(e.target.value)}/>
                  {codeValid && <span className="check-icon">✓</span>}
                </div>
                <button className="join-btn" onClick={handleJoinLeague}>הצטרף</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaguesPage;
