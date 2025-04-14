import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Background from '../../components/Login-back';
import Header from '../../components/Header';
import './LeaguesPage.scss';

function LeaguesPage() {
  const navigate = useNavigate();

  const [leagues, setLeagues] = useState([]);

  // For the inline create league form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leagueName, setLeagueName] = useState('');

  // For the inline "join" league form
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [codeValid, setCodeValid] = useState(false); // to show check icon if code is typed

  useEffect(() => {
    fetchMyLeagues();
  }, []);

  const fetchMyLeagues = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/mine', {
        credentials: 'include',
      });
      const data = await res.json();
      setLeagues(data);
    } catch (error) {
      console.error('Error fetching my leagues:', error);
    }
  };

  // Create league logic (unchanged)
  const handleCreateLeague = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leagueName }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || 'Failed to create league');
        return;
      }
      alert(`ליגה נוצרה בהצלחה! קוד ליגה: ${data.code}`);
      setLeagueName('');
      setShowCreateForm(false);
      fetchMyLeagues();
    } catch (err) {
      console.error('Create league error:', err);
    }
  };

  // Inline join logic
  const handleJoinLeague = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/leagues/join', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || 'Failed to join league');
        return;
      }
      alert(`הצטרפת לליגה: ${data.name}`);
      setJoinCode('');
      setCodeValid(false);
      setShowJoinForm(false);
      fetchMyLeagues();
    } catch (error) {
      console.error('Join league error:', error);
    }
  };

  // Called as user types in code
  const onChangeJoinCode = (value) => {
    setJoinCode(value);
    // If you just want the check icon to show if code length > 2, etc.:
    setCodeValid(value.length == 6);
  };

  return (
    <div className="leagues-page container">
      
      <Background image="background3.png" />
      <Header/>
      <div className= "page-con">
      <h2>הליגות שלי</h2>

      <div className="league-list">
        {leagues.map((lg) => (
          <div
            key={lg._id}
            className="league-card"
            onClick={() => navigate(`/leagues/${lg._id}/leaderboard`)}
          >
            <h3>{lg.name}</h3>
            <p>{lg.members.length} משתתפים </p>
          </div>
        ))}
      </div>

      {/* Inline "create new league" button or form */}
      <div className="create-league-inline">
        {!showCreateForm ? (
          <div className="create-condensed" onClick={() => setShowCreateForm(true)}>
            <span className="create-text">צור ליגה חדשה</span>
            <span className="plus-icon">+</span>
          </div>
        ) : (
          <div className="create-expanded" >
            <div className="header-row" onClick={() => setShowCreateForm(false)}>
              <h3>צור ליגה חדשה </h3>
              <span className="plus-icon">+</span>
            </div>
            <label className="league-label">שם הליגה</label>
            <input
              type="text"
              className="league-input"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
            />
            <button className="create-btn" onClick={handleCreateLeague}>
              צור
            </button>
          </div>
        )}
      </div>

      {/* Inline "join" league button or form (matching the new design) */}
      <div className="join-league-inline">
        {!showJoinForm ? (
          // Condensed "join" with search icon
          <div className="join-condensed" onClick={() => setShowJoinForm(true)}>
            <span className="join-text">הצטרף לליגה קיימת </span>
            <span className="search-icon"><FaSearch/></span>
          </div>
        ) : (
          <div className="join-expanded" >
            {/* top row with "search icon" and "הצטרף לטורניר קיים" text */}
            <div className="header-row-join" onClick={() => setShowJoinForm(false)}>
  
              <h3>הצטרף לליגה קיימת</h3>
              <span className="search-icon"><FaSearch/></span>
            </div>

            {/* code input row => black "הצטרף" button, white input with check if valid */}
            <div className="join-row">

              {/* the code input => show check icon if codeValid */}
              <div className="code-input-wrapper">
                <input
                  type="text"
                  className="code-input"
                  placeholder="548276"
                  value={joinCode}
                  onChange={(e) => onChangeJoinCode(e.target.value)}
                />
                   {codeValid && <span className="check-icon">✓</span>}
              </div>
              <button className="join-btn" onClick={handleJoinLeague}>
                הצטרף
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default LeaguesPage;
