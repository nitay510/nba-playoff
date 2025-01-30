// client/src/pages/HomePage/HomePage.js
import React, { useEffect, useState } from 'react';
import './HomePage.scss';

function HomePage() {
  const [seriesList, setSeriesList] = useState([]);
  const [userBets, setUserBets] = useState({}); // { [seriesId]: [ {category, choiceName, oddsWhenPlaced}, ... ] }

  useEffect(() => {
    fetchSeries();
    fetchUserBets();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/series');
      const data = await res.json();
      setSeriesList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserBets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user-bets', {
        credentials: 'include',
      });
      const data = await res.json();
      // Transform array to object keyed by seriesId
      const betsBySeries = {};
      data.forEach((bet) => {
        betsBySeries[bet.seriesId._id] = bet.bets;
      });
      setUserBets(betsBySeries);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBetChange = (seriesId, category, choice) => {
    // Update local userBets state
    const existing = userBets[seriesId] || [];
    const newBets = existing.filter((b) => b.category !== category); 
    // remove old bet for that category
    newBets.push({ category, choiceName: choice.name, oddsWhenPlaced: choice.odds });
    setUserBets({ ...userBets, [seriesId]: newBets });
  };

  const saveBet = async (series) => {
    try {
      const bets = userBets[series._id] || [];
      const res = await fetch(`http://localhost:5000/api/user-bets/${series._id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets }),
      });
      const data = await res.json();
      console.log('Saved bet:', data);
      // maybe show success message
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main-container home-container">
      <h2>ברוכים הבאים לליגת הפלייאוף!</h2>
      {seriesList.map((series) => {
        const isLocked = series.isLocked;
        const userBet = userBets[series._id] || [];

        return (
          <div key={series._id} className="series-card">
            <h3>{series.teamA} נגד {series.teamB}</h3>
            {isLocked && <p className="locked-msg">סגור להימורים</p>}

            {/* Render bet options */}
            {series.betOptions.map((option) => {
              // e.g. category = "winner"
              const selectedBet = userBet.find((b) => b.category === option.category);
              return (
                <div key={option.category} className="bet-option">
                  <h4>{option.category}</h4>
                  {option.choices.map((choice) => {
                    const isSelected =
                      selectedBet && selectedBet.choiceName === choice.name;
                    return (
                      <label key={choice.name} style={{ marginRight: '1rem' }}>
                        <input
                          type="radio"
                          name={`${series._id}-${option.category}`}
                          checked={isSelected}
                          disabled={isLocked}
                          onChange={() =>
                            handleBetChange(series._id, option.category, choice)
                          }
                        />
                        {choice.name} (Odds: {choice.odds})
                      </label>
                    );
                  })}
                </div>
              );
            })}

            {!isLocked && (
              <button onClick={() => saveBet(series)}>שמור הימור</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HomePage;
