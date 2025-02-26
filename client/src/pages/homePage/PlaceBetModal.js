import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';    // for the top-right close icon
import CountdownClock from '../../components/CountdownClock'; 
import TeamLogo from '../../components/TeamLogo'; 
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

  // Reuse your parseGamesNumber, syncGamesPick, handleChoiceSelect, etc.
  const findBetForCategory = (category) =>
    localBets.find((b) => b.category === category);

  const parseGamesNumber = (str = '') => {
    const match = str.match(/\d+/);
    return match ? match[0] : null;
  };

  const syncGamesPick = (updatedBets) => {
    const winnerBet = updatedBets.find((b) => b.category === 'מנצחת הסדרה');
    const gamesBet = updatedBets.find((b) => b.category === 'בכמה משחקים');
    if (!winnerBet || !gamesBet) return updatedBets;

    const numericStr = parseGamesNumber(gamesBet.choiceName);
    if (!numericStr) return updatedBets;

    if (winnerBet.choiceName) {
      const combined = `${winnerBet.choiceName} ב${numericStr}`;
      const newArr = updatedBets.map((b) =>
        b.category === 'בכמה משחקים' ? { ...b, choiceName: combined } : b
      );
      return newArr;
    }
    return updatedBets;
  };

  const handleChoiceSelect = (category, choice) => {
    let updated = [...localBets];
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
    updated = syncGamesPick(updated);
    setLocalBets(updated);
  };

  const isChoiceSelected = (category, cName) => {
    const bet = findBetForCategory(category);
    if (!bet) return false;

    if (category === 'מנצחת הסדרה') {
      return bet.choiceName === cName;
    }
    if (category === 'בכמה משחקים') {
      const betNum = parseGamesNumber(bet.choiceName);
      const cNum = parseGamesNumber(cName);
      return betNum && cNum && betNum === cNum;
    }
    // any other category => direct match
    return bet.choiceName === cName;
  };

  // We'll assume we can compute countdown from series.startDate if needed
  // or pass something in. If you want "01:10:00" precisely from the mock:
  // you can do that here with your CountdownClock logic:
  const getCountdown = () => {
    if (series.startDate) {
      const now = new Date();
      if (new Date(series.startDate) > now) {
        return <CountdownClock startDate={series.startDate} />;
      }
    }
    return null;
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
        {/* Top bar with "סיום הימור בעוד" and countdown, plus close X */}
        <div className="top-bar">
          <div className="top-bar-center">
          <span style={{ opacity: 0.75 }}>סיום הימור בעוד</span>
            <div className="countdown-text">{getCountdown()}</div>
          </div>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>

        {/* Middle row: Two logos with a dash between */}
        <div className="teams-row">
          <TeamLogo teamName={series.teamA} className="team-logo" />
          <span className="teams-dash">-</span>
          <TeamLogo teamName={series.teamB} className="team-logo" />
        </div>

        {/* Bet categories displayed in "pill" style */}
        <div className="bet-options">
          {series.betOptions.map((opt, i) => (
            <div key={i} className="bet-category">
              <h5>{opt.category}</h5>
              <div className="pill-container">
                {opt.choices.map((c, j) => {
                  const selected = isChoiceSelected(opt.category, c.name);
                  return (
                    <div
                      key={j}
                      className={`pill ${selected ? 'selected' : ''}`}
                      onClick={() => handleChoiceSelect(opt.category, c)}
                    >
                      {c.name}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row: save/cancel */}
        <div className="modal-actions">
        
          <button className="primary-btn" onClick={handleSaveBet}>
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

export default PlaceBetModal;
