// client/src/pages/adminPage/AdminFinishedPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsModal from './ResultsModal';
import './AdminFinshedPage.scss';
function AdminFinishedPage() {
  const navigate = useNavigate();
  const [seriesList, setSeriesList] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  useEffect(() => {
    fetchFinishedSeries();
  }, []);

  const fetchFinishedSeries = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/series', {
        credentials: 'include',
      });
      const data = await res.json();
      // filter for "finished" => e.g. isFinished = true
      const finished = data.filter((s) => s.isFinished);
      setSeriesList(finished);
    } catch (error) {
      console.error(error);
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
      <h2>סדרות שהסתיימו</h2>

      <button className="back-btn" onClick={() => navigate('/admin')}>
        חזרה לסדרות פעילות
      </button>

      <div className="series-list">
        {seriesList.length === 0 ? (
          <p>אין סדרות שהסתיימו.</p>
        ) : (
          seriesList.map((s) => (
            <div key={s._id} className="series-card">
              <h3>{s.teamA} נגד {s.teamB}</h3>
              <p>
                תאריך התחלה:{' '}
                {s.startDate ? new Date(s.startDate).toLocaleString('he-IL') : '---'}
              </p>
              <p>נעול? {s.isLocked ? 'כן' : 'לא'}</p>
              <p>הסתיים? כן</p>

              <button onClick={() => openResultsModal(s)}>
                ערוך תוצאות
              </button>
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
