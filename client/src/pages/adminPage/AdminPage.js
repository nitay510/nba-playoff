import React, { useState, useEffect } from 'react';
import SeriesModal from './SeriesModal';
import ResultsModal from './ResultsModal';
import './AdminPage.scss';

function AdminPage() {
  const [seriesList, setSeriesList] = useState([]);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [editSeries, setEditSeries] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series', {
        credentials: 'include',
      });
      const data = await res.json();
      setSeriesList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNew = () => {
    setEditSeries(null);
    setShowSeriesModal(true);
  };

  const handleEdit = (series) => {
    setEditSeries(series);
    setShowSeriesModal(true);
  };

  const onModalSave = () => {
    setShowSeriesModal(false);
    fetchSeries();
  };

  const handleLockToggle = async (s) => {
    try {
      await fetch(`http://localhost:5000/api/series/${s._id}/lock`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !s.isLocked }),
      });
      fetchSeries();
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
    fetchSeries();
  };

  return (
    <div className="admin-page container">
      <h2>ניהול סדרות פלייאוף</h2>
      <button className="primary-btn" onClick={handleCreateNew}>
        + צור סדרה חדשה
      </button>

      <div className="series-list">
        {seriesList.map((s) => (
          <div key={s._id} className="series-card">
            <h3>{s.teamA} נגד {s.teamB}</h3>
            <p>נעול? {s.isLocked ? 'כן' : 'לא'}</p>
            <p>הסתיים? {s.isFinished ? 'כן' : 'לא'}</p>
            <div className="actions">
              <button className="primary-btn" onClick={() => handleEdit(s)}>
                ערוך
              </button>
              <button className="danger-btn" onClick={() => handleLockToggle(s)}>
                {s.isLocked ? 'בטל נעילה' : 'נעל'}
              </button>
              {/* show "Set Results" if locked && not finished */}
              {s.isLocked && !s.isFinished && (
                <button className="results-btn" onClick={() => openResultsModal(s)}>
                  הגדר תוצאות
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showSeriesModal && (
        <SeriesModal
          onClose={() => setShowSeriesModal(false)}
          onSave={onModalSave}
          existingSeries={editSeries}
        />
      )}

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

export default AdminPage;
