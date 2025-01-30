// client/src/pages/AdminPage/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.scss';

function AdminPage() {
  const [seriesList, setSeriesList] = useState([]);
  // Form states
  const [teamA, setTeamA] = useState('');
  const navigate = useNavigate();
  const [teamB, setTeamB] = useState('');
  const [betOptions, setBetOptions] = useState([
    { category: 'winner', choices: [{ name: 'Team A', odds: 1.0 }, { name: 'Team B', odds: 1.0 }] },
  ]);
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser !== 'nitay510') {
      // not admin, go home
      navigate('/');
    }
  }, [navigate]);
  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series', { credentials: 'include' });
      const data = await res.json();
      setSeriesList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamA, teamB, betOptions }),
      });
      const data = await res.json();
      console.log('Created series:', data);
      fetchSeries(); // refresh
    } catch (error) {
      console.error(error);
    }
  };

  const lockSeries = async (seriesId, lockState) => {
    try {
      const res = await fetch(`http://localhost:5000/api/series/${seriesId}/lock`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: lockState }),
      });
      const data = await res.json();
      console.log('Locked/unlocked:', data);
      fetchSeries();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main-container admin-container">
      <h2>ניהול סדרות פלייאוף</h2>

      <div className="create-series-form">
        <h3>צור סדרה חדשה</h3>
        <input
          type="text"
          placeholder="קבוצה א'"
          value={teamA}
          onChange={(e) => setTeamA(e.target.value)}
        />
        <input
          type="text"
          placeholder="קבוצה ב'"
          value={teamB}
          onChange={(e) => setTeamB(e.target.value)}
        />

        {/* For simplicity, we’ll just show 1 bet option block in this example */}
        <button onClick={handleCreateSeries}>צור סדרה</button>
      </div>

      <div className="series-list">
        <h3>כל הסדרות</h3>
        {seriesList.map((s) => (
          <div key={s._id} className="series-item">
            <p>{s.teamA} נגד {s.teamB}</p>
            <p>סטטוס: {s.isLocked ? 'נעול' : 'פתוח'}</p>
            {s.isLocked ? (
              <button onClick={() => lockSeries(s._id, false)}>בטל נעילה</button>
            ) : (
              <button onClick={() => lockSeries(s._id, true)}>נעול</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
