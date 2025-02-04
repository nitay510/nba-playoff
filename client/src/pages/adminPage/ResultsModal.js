import React, { useState } from 'react';
import './ResultsModal.scss';

function ResultsModal({ series, onClose, onResultsSaved }) {
  // local state for final results
  const initialFinals = (series.betOptions || []).map((opt) => ({
    category: opt.category,
    finalChoice: opt.finalChoice || '',
  }));
  const [localResults, setLocalResults] = useState(initialFinals);

  const handleChoiceSelect = (category, choiceName) => {
    const updated = localResults.map((fr) => {
      if (fr.category === category) return { ...fr, finalChoice: choiceName };
      return fr;
    });
    setLocalResults(updated);
  };

  const handleSaveResults = async () => {
    try {
      const finalResults = localResults.map((fr) => ({
        category: fr.category,
        finalChoice: fr.finalChoice,
      }));

      const res = await fetch(`http://localhost:5000/api/series/${series._id}/results`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalResults }),
      });
      const data = await res.json();
      console.log('Results saved:', data);

      onResultsSaved();
      onClose();
    } catch (error) {
      console.error('Error saving final results:', error);
    }
  };

  return (
    <div className="results-modal-overlay">
      <div className="results-modal">
        <h3>הגדר תוצאות עבור {series.teamA} נגד {series.teamB}</h3>

        {series.betOptions?.map((opt) => {
          const localVal = localResults.find((fr) => fr.category === opt.category);
          return (
            <div key={opt.category} className="results-category">
              <strong>{opt.category}</strong>
              <div className="choices">
                {opt.choices.map((c) => {
                  const isSelected = localVal?.finalChoice === c.name;
                  return (
                    <label key={c.name} style={{ marginRight: '1rem' }}>
                      <input
                        type="radio"
                        name={opt.category}
                        checked={isSelected}
                        onChange={() => handleChoiceSelect(opt.category, c.name)}
                      />
                      {c.name}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="results-actions">
          <button onClick={handleSaveResults}>שמור תוצאות</button>
          <button onClick={onClose}>בטל</button>
        </div>
      </div>
    </div>
  );
}

export default ResultsModal;
