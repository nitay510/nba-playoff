import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../../components/TeamLogo';
import Background from '../../components/Login-back';
import './championSelectionPage.scss';

// Your 20 teams with odds
// We'll sort them ascending by 'odds' so the lowest is top-left
const TOP_20_TEAMS = [
  { name: 'קליבלנד קאבלירס', odds: 2.5 },
  { name: 'בוסטון סלטיקס', odds: 3.0 },
  { name: 'מילווקי באקס', odds: 3.2 },
  { name: 'אינדיאנה פייסרס', odds: 4.5 },
  { name: 'ניו יורק ניקס', odds: 7.0 },
  { name: 'אטלנטה הוקס', odds: 9.0 },
  { name: 'מיאמי היט', odds: 11.0 },
  { name: 'דטרויט פיסטונס', odds: 15.0 },
  { name: 'אורלנדו מגיק', odds: 20.0 },
  { name: 'שיקאגו בולס', odds: 25.0 },
  { name: 'אוקלהומה סיטי', odds: 2.2 },
  { name: 'דנבר נאגטס', odds: 3.5 },
  { name: 'ממפיס גריזליס', odds: 4.0 },
  { name: 'סקרמנטו קינגס', odds: 6.0 },
  { name: 'לוס אנגלס לייקרס', odds: 8.0 },
  { name: 'לוס אנגלס קליפרס', odds: 10.0 },
  { name: 'גולדן סטייט ווריוורס', odds: 12.0 },
  { name: 'יוסטון רוקטס', odds: 14.0 },
  { name: 'מינסוטה טימברוולבס', odds: 18.0 },
  { name: 'דאלאס מאבריקס', odds: 25.0 },
];

export default function ChampionSelectionPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (!storedUser) {
      // if no user, go back to login or something
      navigate('/');
    } else {
      setUsername(storedUser);
    }
  }, [navigate]);

  // sort teams by ascending odds
  const sortedTeams = [...TOP_20_TEAMS].sort((a, b) => a.odds - b.odds);

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
      // On success => /home
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

      {/* Main card containing both the teams grid and the centered button */}
      <div className="main-card">
        {/* Scrollable grid of teams */}
        <div className="teams-grid">
          {sortedTeams.map((team) => {
            const isSelected = team.name === selectedTeam;
            return (
              <div
                key={team.name}
                className={`team-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectTeam(team.name)}
              >
                <TeamLogo teamName={team.name} className="logo-img" />
                <div className="team-odds-box">
                  <span className="team-odds">יחס: {team.odds}</span>
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
