import React, { useState, useEffect } from 'react';
import './PlaceBetModal.scss';

function PlaceBetModal({ series, userBet, onClose, onSave }) {
  const [localBets, setLocalBets] = useState([]);

  useEffect(() => {
    if (userBet) {
      setLocalBets(userBet.bets);
    } else {
      setLocalBets([]);
    }
  }, [userBet]);

  const findBetForCategory = (category) =>
    localBets.find((b) => b.category === category);

  const handleChoiceSelect = (category, choice) => {
    const updated = [...localBets];
    const idx = updated.findIndex((b) => b.category === category);

    if (idx === -1) {
      updated.push({
        category,
        choiceName: choice.name,
        oddsWhenPlaced: choice.odds,
      });
    } else {
      updated[idx] = {
        category,
        choiceName: choice.name,
        oddsWhenPlaced: choice.odds,
      };
    }
    setLocalBets(updated);
  };

  const handleSaveBet = async () => {
    try {
      await fetch(`http://localhost:5000/api/user-bets/${series._id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets: localBets }),
      });
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="place-bet-modal-overlay">
      <div className="place-bet-modal">
        <h3>
          הימור על {series.teamA} נגד {series.teamB}
        </h3>
        {series.betOptions.map((opt, i) => {
          const userSelection = findBetForCategory(opt.category);
          return (
            <div key={i} className="bet-category">
              <h4>{opt.category}</h4>
              {opt.choices.map((c, j) => {
                const isSelected =
                  userSelection && userSelection.choiceName === c.name;
                return (
                  <label key={j} className="bet-choice">
                    <input
                      type="radio"
                      name={`category-${opt.category}`}
                      checked={isSelected}
                      onChange={() => handleChoiceSelect(opt.category, c)}
                    />
                    {c.name} (יחס: {c.odds})
                  </label>
                );
              })}
            </div>
          );
        })}

        <div className="modal-actions">
          <button className="primary-btn" onClick={handleSaveBet}>
            שמור הימור
          </button>
          <button className="cancel-btn" onClick={onClose}>
            בטל
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceBetModal;
