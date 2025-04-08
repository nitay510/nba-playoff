import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../../components/TeamLogo';
import Background from '../../components/Login-back';
import './championSelectionPage.scss';

export default function ChampionSelectionPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (!storedUser) {
      navigate('/');
    } else {
      setUsername(storedUser);
    }
  }, [navigate]);

  // Final odds (already computed by the rule: <40 => ×3, >=40 => ×2).
  // Then we list them in ascending order of final odds.
  const TEAMS = [
    { name: 'בוסטון סלטיקס', odds: 4 },
    { name: 'אוקלהומה סיטי', odds: 3 },
    { name: 'קליבלנד קאבלירס', odds: 6 },
    { name: 'לוס אנגלס לייקרס', odds: 8 },
    { name: 'דנבר נאגטס', odds: 9 },
    { name: 'גולדן סטייט ווריוורס', odds: 11 },
    { name: 'מילווקי באקס', odds: 20 },
    { name: 'סקרמנטו קינגס', odds: 100 },
    { name: 'ניו יורק ניקס', odds: 12 },
    { name: 'ממפיס גריזליס', odds: 20 },
    { name: 'מיאמי היט', odds: 100 },
    { name: 'לוס אנגלס קליפרס', odds: 25 },
    { name: 'מינסוטה טימברוולבס', odds: 20 },
    { name: 'יוסטון רוקטס', odds: 25 },
    { name: 'אינדיאנה פייסרס', odds: 30 },
    { name: 'אורלנדו מגיק', odds: 50 },
    { name: 'דטרויט פיסטונס', odds: 30 },
    { name: 'אטלנטה הוקס', odds: 100 },
    { name: 'שיקאגו בולס', odds: 100 },
    { name: 'דאלאס מאבריקס', odds: 100 },
  ];

  const handleSelectTeam = (teamName) => {
    setSelectedTeam(teamName);
  };

  const handleSubmitChampion = async () => {
    if (!selectedTeam) {
      alert('אנא בחר קבוצה שתהיה האלופה');
      return;
    }
    if (!username) {
      alert('לא נמצא שם משתמש');
      return;
    }

    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/auth/set-champion', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, champion: selectedTeam }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || 'שגיאה בעדכון האלוף');
        return;
      }
      navigate('/home');
    } catch (error) {
      console.error('Set champion error:', error);
      alert('שגיאה בשרת');
    }
  };

  return (
    <div className="champion-selection-page">
      <Background image="open-screen.png" />
      <h1 className="page-title">מי תהיה האלופה ?</h1>

      <div className="main-card">
        <div className="teams-grid">
          {TEAMS.map((team) => {
            const isSelected = team.name === selectedTeam;
            return (
              <div
                key={team.name}
                className={`team-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectTeam(team.name)}
              >
                <TeamLogo teamName={team.name} className="logo-img" />
                <div className="team-odds-box">
                  {/* Show to 1 or 2 decimal places if you wish */}
                  <span className="team-odds">יחס: {team.odds.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button className="submit-btn" onClick={handleSubmitChampion}>
          אישור
        </button>
      </div>
    </div>
  );
}
