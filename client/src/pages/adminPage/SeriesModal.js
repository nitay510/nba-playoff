import React, { useState, useEffect } from 'react';
import './SeriesModal.scss';

function SeriesModal({ onClose, onSave, existingSeries }) {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [betOptions, setBetOptions] = useState([
    {
      category: 'מנצחת הסדרה',
      choices: [
        { name: "קבוצה א'", odds: 1.0 },
        { name: "קבוצה ב'", odds: 1.0 },
      ],
    },
    {
      category: 'בכמה משחקים',
      choices: [
        { name: '4 משחקים', odds: 3.0 },
        { name: '5 משחקים', odds: 2.5 },
        { name: '6 משחקים', odds: 2.5 },
        { name: '7 משחקים', odds: 2.5 },
      ],
    },
  ]);
  const [startDateStr, setStartDateStr] = useState('');

  useEffect(() => {
    if (existingSeries) {
      setTeamA(existingSeries.teamA);
      setTeamB(existingSeries.teamB);
      setBetOptions(existingSeries.betOptions || []);

      if (existingSeries.startDate) {
        const d = new Date(existingSeries.startDate);
        const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setStartDateStr(localISO);
      }
    }
  }, [existingSeries]);

  useEffect(() => {
    const winnerIndex = betOptions.findIndex((o) => o.category === 'מנצחת הסדרה');
    if (winnerIndex !== -1) {
      const updated = [...betOptions];
      if (updated[winnerIndex].choices.length >= 2) {
        updated[winnerIndex].choices[0].name = teamA || "קבוצה א'";
        updated[winnerIndex].choices[1].name = teamB || "קבוצה ב'";
      }
      setBetOptions(updated);
    }
  }, [teamA, teamB, betOptions]);

  const handleSave = async () => {
    try {
      let startDate = null;
      if (startDateStr) {
        startDate = new Date(startDateStr);
      }

      const bodyData = {
        teamA,
        teamB,
        betOptions,
        startDate,
      };

      let url = 'http://localhost:5000/api/series';
      let method = 'POST';

      if (existingSeries) {
        url = `http://localhost:5000/api/series/${existingSeries._id}`;
        method = 'PUT';
      }

      await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save series:', error);
    }
  };

  const updateOdds = (catIndex, choiceIndex, newOdds) => {
    const updated = [...betOptions];
    updated[catIndex].choices[choiceIndex].odds = parseFloat(newOdds) || 0;
    setBetOptions(updated);
  };

  const updateChoiceName = (catIndex, choiceIndex, newName) => {
    const updated = [...betOptions];
    updated[catIndex].choices[choiceIndex].name = newName;
    setBetOptions(updated);
  };

  const addNewCategory = () => {
    const catName = prompt('הכנס שם לקטגוריה החדשה:');
    if (catName && catName.trim()) {
      const updated = [...betOptions];
      updated.push({
        category: catName,
        choices: [{ name: 'אופציה 1', odds: 1.0 }],
      });
      setBetOptions(updated);
    }
  };

  const addChoiceToCategory = (catIndex) => {
    const updated = [...betOptions];
    updated[catIndex].choices.push({ name: 'אופציה חדשה', odds: 1.0 });
    setBetOptions(updated);
  };

  return (
    <div className="series-modal-overlay">
      <div className="series-modal">
        <h3 className="modal-title">
          {existingSeries ? 'עריכת סדרה' : 'יצירת סדרה חדשה'}
        </h3>

        <label className="modal-label">קבוצה א'</label>
        <input
          className="modal-input"
          type="text"
          value={teamA}
          onChange={(e) => setTeamA(e.target.value)}
        />

        <label className="modal-label">קבוצה ב'</label>
        <input
          className="modal-input"
          type="text"
          value={teamB}
          onChange={(e) => setTeamB(e.target.value)}
        />

        <label className="modal-label">תאריך התחלה (ננעל אוטומטית בשעה זו):</label>
        <input
          className="modal-input"
          type="datetime-local"
          value={startDateStr}
          onChange={(e) => setStartDateStr(e.target.value)}
        />

        <h4 className="bet-options-header">אפשרויות הימור</h4>
        {betOptions.map((opt, i) => (
          <div key={i} className="bet-category">
            <strong className="bet-category-title">{opt.category}</strong>
            <button
              type="button"
              className="add-choice-btn"
              onClick={() => addChoiceToCategory(i)}
            >
              + הוסף אופציה
            </button>

            {opt.choices.map((c, j) => {
              const isDefaultWinner =
                opt.category === 'מנצחת הסדרה' && j < 2;
              return (
                <div key={j} className="bet-choice">
                  <input
                    className="choice-name-input"
                    type="text"
                    value={c.name}
                    onChange={(e) =>
                      !isDefaultWinner && updateChoiceName(i, j, e.target.value)
                    }
                    disabled={isDefaultWinner}
                  />

                  <input
                    className="choice-odds-input"
                    type="number"
                    step="0.1"
                    value={c.odds}
                    onChange={(e) => updateOdds(i, j, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        ))}

        <button className="add-category-btn" onClick={addNewCategory}>
          + הוסף קטגוריית הימור
        </button>

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>
            שמור
          </button>
          <button className="cancel-btn" onClick={onClose}>
            בטל
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeriesModal;
