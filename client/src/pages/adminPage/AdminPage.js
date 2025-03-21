// client/src/pages/adminPage/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsModal from './ResultsModal';
import SeriesModal from './SeriesModal'; // to create new series
import CountdownClock from '../../components/CountdownClock';
import './AdminPage.scss';

function AdminPage() {
  const navigate = useNavigate();

  const [seriesList, setSeriesList] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  const [showSeriesModal, setShowSeriesModal] = useState(false); // for creating a new series
  const [editSeries, setEditSeries] = useState(null); // not used for create

  useEffect(() => {
    fetchUnfinishedSeries();
  }, []);

  const fetchUnfinishedSeries = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/series', {
        credentials: 'include',
      });
      const data = await res.json();
      // show only isFinished = false
      const unfinished = data.filter((s) => !s.isFinished);
      setSeriesList(unfinished);
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
    fetchUnfinishedSeries(); // refresh
  };

  // + For creating a brand new series
  const handleCreateNew = () => {
    setEditSeries(null);
    setShowSeriesModal(true);
  };

  const onSeriesModalSave = () => {
    setShowSeriesModal(false);
    fetchUnfinishedSeries(); // refresh
  };

  return (
    <div className="admin-page container">
      <h2>ניהול סדרות </h2>

      {/* Top action buttons */}
      <div className="admin-actions">
        <button onClick={handleCreateNew} className="create-series-btn">
          + צור סדרה חדשה
        </button>
        <button onClick={() => navigate('/admin/finished')} className="finished-btn">
          ראה סדרות שהסתיימו
        </button>
      </div>

      <div className="series-list">
        {seriesList.length === 0 ? (
          <p>אין סדרות פעילות ללא תוצאות.</p>
        ) : (
          seriesList.map((s) => {
            let countdownText = '';
            if (s.startDate) {
              const now = new Date();
              if (new Date(s.startDate) > now) {
                countdownText = <CountdownClock startDate={s.startDate} />;
              } else {
                countdownText = 'הסדרה התחילה';
              }
            } else {
              countdownText = 'אין תאריך התחלה';
            }

            return (
              <div key={s._id} className="series-card">
                <h3>{s.teamA} נגד {s.teamB}</h3>
                <p>תאריך התחלה: 
                  {s.startDate ? new Date(s.startDate).toLocaleString('he-IL') : '---'}
                </p>
                <p>ספירה לאחור: {countdownText}</p>
                <p>נעול? {s.isLocked ? 'כן' : 'לא'}</p>

                {/* If you want to set final results */}
                <button onClick={() => openResultsModal(s)}>
                  הגדר תוצאות
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for setting final results */}
      {showResultsModal && currentSeries && (
        <ResultsModal
          series={currentSeries}
          onClose={() => setShowResultsModal(false)}
          onResultsSaved={onResultsSaved}
        />
      )}

      {/* Modal for creating a new series */}
      {showSeriesModal && (
        <SeriesModal
          onClose={() => setShowSeriesModal(false)}
          onSave={onSeriesModalSave}
          existingSeries={editSeries} // should be null for creation
        />
      )}
    </div>
  );
}

export default AdminPage;
