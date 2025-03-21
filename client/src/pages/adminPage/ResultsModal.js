import React, { useState } from 'react';
import './ResultsModal.scss';

function ResultsModal({ series, onClose, onResultsSaved }) {
  // Build local state: each category => finalChoice
  const initialFinals = (series.betOptions || []).map((opt) => ({
    category: opt.category,
    finalChoice: opt.finalChoice || '',
  }));
  const [localResults, setLocalResults] = useState(initialFinals);

  // 1) Helper: parse numeric from strings like "5 משחקים" or "מילווקי ב5" => "5"
  const parseGamesNumber = (str = '') => {
    const match = str.match(/\d+/);
    return match ? match[0] : null;
  };

  // 2) Combine "winner" + numeric for second category if both exist
  const syncGamesFinalChoice = (updated) => {
    const winner = updated.find((fr) => fr.category === 'מנצחת הסדרה');
    const games = updated.find((fr) => fr.category === 'בכמה משחקים');
    if (!winner || !games) return updated;

    if (!winner.finalChoice || !games.finalChoice) return updated;

    // parse numeric from e.g. "5 משחקים"
    const numericStr = parseGamesNumber(games.finalChoice);
    if (!numericStr) return updated;

    // if the winner is "מילווקי", store "מילווקי ב5"
    // if winner is empty, we keep the raw "5 משחקים"
    const combined = `${winner.finalChoice} ב${numericStr}`;

    // replace the second category's finalChoice
    const newArr = updated.map((fr) => {
      if (fr.category === 'בכמה משחקים') {
        return { ...fr, finalChoice: combined };
      }
      return fr;
    });
    return newArr;
  };

  // 3) For checking if a radio is selected
  // We compare the numeric portion if it's "בכמה משחקים"
  // or do an exact check if it's "מנצחת הסדרה"
  const isChoiceSelected = (catName, radioName, finalChoice) => {
    if (catName === 'מנצחת הסדרה') {
      return finalChoice === radioName;
    }
    if (catName === 'בכמה משחקים') {
      const chosenNum = parseGamesNumber(finalChoice);
      const radioNum = parseGamesNumber(radioName);
      return chosenNum && radioNum && chosenNum === radioNum;
    }
    // other categories (if any) => exact
    return finalChoice === radioName;
  };

  // 4) When the admin selects a choice
  const handleChoiceSelect = (category, choiceName) => {
    // e.g. user picks "5 משחקים" for the second cat
    // or picks "מילווקי" for the first cat
    let updated = localResults.map((fr) => {
      if (fr.category === category) {
        return { ...fr, finalChoice: choiceName };
      }
      return fr;
    });

    // Combine winner + numeric if both exist
    updated = syncGamesFinalChoice(updated);
    setLocalResults(updated);
  };

  const handleSaveResults = async () => {
    try {
      const finalResults = localResults.map((fr) => ({
        category: fr.category,
        finalChoice: fr.finalChoice,
      }));

      const res = await fetch(`https://nba-playoff-eyd5.onrender.com/api/series/${series._id}/results`, {
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
                  // Check if this radio is selected => numeric or exact
                  const selected = isChoiceSelected(
                    opt.category,
                    c.name,
                    localVal?.finalChoice
                  );
                  return (
                    <label key={c.name} style={{ marginRight: '1rem' }}>
                      <input
                        type="radio"
                        name={opt.category}
                        checked={selected}
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
