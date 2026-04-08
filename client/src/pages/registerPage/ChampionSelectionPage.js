import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../../components/TeamLogo';
import Background from '../../components/Login-back';
import './championSelectionPage.scss';

// 2025-26 NBA Playoff + Play-In teams (20 teams), sorted by odds
const TEAMS = [
  { name: 'אוקלהומה סיטי',           odds: 3.00 },
  { name: 'בוסטון סלטיקס',           odds: 6.0 },
  { name: 'קליבלנד קאבלירס',         odds: 11.00 },
  { name: 'ניו יורק ניקס',           odds: 12.00 },
  { name: 'דנבר נאגטס',              odds: 8.0 },
  { name: 'יוסטון רוקטס',            odds: 20.00 },
  { name: 'מינסוטה טימברוולבס',      odds: 15.00 },
  { name: 'לוס אנגלס לייקרס',        odds: 20.00 },
  { name: 'גולדן סטייט ווריוורס',    odds: 30.0 },
  { name: 'פיניקס סאנס',             odds: 25.00 },
  { name: 'לוס אנגלס קליפרס',        odds: 30.0 },
  { name: 'דטרויט פיסטונס',          odds: 12.00 },
  { name: 'אורלנדו מגיק',            odds: 30.00 },
  { name: 'פילדלפיה 76',             odds: 25.00 },
  { name: 'מיאמי היט',               odds: 30.0 },
  { name: 'סן אנטוניו ספרס',         odds: 5.0 },
  { name: 'אטלנטה הוקס',             odds: 25.00 },
  { name: 'טורונטו ראפטורס',         odds: 30.00 },
  { name: 'פורטלנד טרייל בלייזרס',  odds: 30.00 },
  { name: 'שרלוט הורנטס',            odds: 25.00 },
];

export default function ChampionSelectionPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [username,     setUsername]     = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (!stored) { navigate('/'); return; }
    setUsername(stored);
  }, [navigate]);

  const handleSubmit = async () => {
    if (!selectedTeam) { alert('אנא בחר קבוצה שתהיה האלופה'); return; }
    if (!username)     { alert('לא נמצא שם משתמש'); return; }

    try {
      const res  = await fetch('/api/auth/set-champion', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, champion: selectedTeam }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.msg || 'שגיאה'); return; }
      navigate('/home');
    } catch {
      alert('שגיאה בשרת');
    }
  };

  return (
    <div className="champion-selection-page">
      <Background image="open-screen.png" />
      <h1 className="page-title">מי תהיה האלופה?</h1>

      <div className="main-card">
        <div className="teams-grid">
          {TEAMS.map((team) => (
            <div
              key={team.name}
              className={`team-cell ${team.name === selectedTeam ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(team.name)}
            >
              <TeamLogo teamName={team.name} className="logo-img" />
              <div className="team-odds-box">
                <span className="team-odds">יחס: {team.odds.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          אישור
        </button>
      </div>
    </div>
  );
}
