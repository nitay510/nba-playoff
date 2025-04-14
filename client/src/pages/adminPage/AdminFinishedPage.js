import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsModal from './ResultsModal';
import './AdminFinshedPage.scss';

function AdminFinishedPage() {
  const navigate = useNavigate();
  const [seriesList, setSeriesList] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  /* fetch finished series once */
  useEffect(() => {
    fetchFinishedSeries();
  }, []);

  const fetchFinishedSeries = async () => {
    try {
      const res = await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/series',
        { credentials: 'include' }
      );
      const data = await res.json();
      setSeriesList(data.filter((s) => s.isFinished));
    } catch (err) {
      console.error(err);
    }
  };

  /* logout – clear cookie + localStorage */
  const handleLogout = async () => {
    try {
      await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/auth/logout',
        { method: 'POST', credentials: 'include' }
      );
    } catch (_) {
      /* even if request fails we still clear storage */
    } finally {
      localStorage.removeItem('username');
      navigate('/');
    }
  };

  const openResultsModal = (series) => {
    setCurrentSeries(series);
    setShowResultsModal(true);
  };

  const onResultsSaved = () => {
    setShowResultsModal(false);
    fetchFinishedSeries();
  };

  return (
    <div className="admin-finished container">
      {/* top bar */}
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          חזרה לסדרות פעילות
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          התנתקות
        </button>
      </div>

      <h2>סדרות שהסתיימו</h2>

      <div className="series-list">
        {seriesList.length === 0 ? (
          <p>אין סדרות שהסתיימו.</p>
        ) : (
          seriesList.map((s) => (
            <div key={s._id} className="series-card">
              <h3>
                {s.teamA} נגד {s.teamB}
              </h3>
              <p>
                תאריך התחלה:{' '}
                {s.startDate
                  ? new Date(s.startDate).toLocaleString('he-IL')
                  : '---'}
              </p>
              <p>נעול? {s.isLocked ? 'כן' : 'לא'}</p>
              <p>הסתיים? כן</p>

              <button onClick={() => openResultsModal(s)}>ערוך תוצאות</button>
            </div>
          ))
        )}
      </div>

      {showResultsModal && currentSeries && (
        <ResultsModal
          series={currentSeries}
          onClose={() => setShowResultsModal(false)}
          onResultsSaved={onResultsSaved}
        />
      )}
    </div>
  );
}

export default AdminFinishedPage;
