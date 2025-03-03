import React, { useEffect, useState } from 'react';
import Background from '../../components/Login-back';
import TeamLogo from '../../components/TeamLogo';
import { calculateSeriesPoints } from '../../utils/points';
import { FaTimes } from 'react-icons/fa';
import './MyBetsPage.scss';

function MyBetsPage() {
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({}); // track which cards are expanded
  const [activePage, setActivePage] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    fetchAllUserBets();
  }, []);

  const fetchAllUserBets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user-bets/all', {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to fetch user bets');
      }
      const data = await res.json();
      setUserBets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Separate active and finished bets
  const activeBets = userBets.filter(
    (ub) => ub.seriesId && !ub.seriesId.isFinished && ub.seriesId.isLocked
  );
  const finishedBets = userBets.filter(
    (ub) => ub.seriesId && ub.seriesId.isFinished && ub.seriesId.isLocked
  );

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  // We mimic the "pills" style from the place-bet form, but read-only
  // So we see which picks the user made, with .selected if it matches
  // We do not allow any click changes.

  // Helper to check if user picked a certain choice
  const isChoiceSelected = (ub, category, choiceName) => { 
    const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';

    const catBet = ub.bets.find((b) => b.category === category);
    if (!catBet) return false;

    if (category === "בכמה משחקים") {
        return extractNumbers(catBet.choiceName) === extractNumbers(choiceName);
    }

    return catBet.choiceName === choiceName;
};

  return (
    <div className="my-bets-page">
      <Background image="background2.png" />
      <h2>ההימורים שלי</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button
          onClick={() => setActivePage('active')}
          className={activePage === 'active' ? 'active' : ''}
        >
          פעילים
        </button>
        <button
          onClick={() => setActivePage('history')}
          className={activePage === 'history' ? 'active' : ''}
        >
          היסטוריה
        </button>
      </div>

      {/* Show Active Bets */}
      {activePage === 'active' && (
        <>
          {activeBets.length === 0 ? (
            <p>אין הימורים פעילים.</p>
          ) : (
            activeBets.map((ub) => {
              const series = ub.seriesId;
              const betId = ub._id;
              const isExpanded = !!expanded[betId];

              return (
                <div
                  key={betId}
                  className="mybet-card"
                  onClick={() => toggleExpand(betId)}
                >
                  {/* Collapsed View */}
                  {!isExpanded && (
                    <div className="mybet-header">
                      <div className="left-logos">
                        <TeamLogo teamName={series.teamA} className="big-logo" />
                        <TeamLogo teamName={series.teamB} className="big-logo" />
                      </div>
                      <div className="right-column">
                        <span className="bet-status">הימור פעיל</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Pink Panel - read-only form style */}
                  {isExpanded && (
                    <div className="mybet-expanded">
                      <div className="top-bar">
                        <div className="top-bar-center">
                          <span className="bet-status">הימור פעיל</span>
                        </div>
                        <FaTimes
                          className="close-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(betId);
                          }}
                        />
                      </div>

                      <div className="teams-row">
                        <TeamLogo teamName={series.teamA} className="team-logo" />
                        <span className="teams-dash">-</span>
                        <TeamLogo teamName={series.teamB} className="team-logo" />
                      </div>

                      <div className="bet-details-pill">
                        {/* We replicate the "bet-options" style from place-bet,
                            but each category is read-only, showing user picks. */}
                        {series.betOptions.map((cat, i) => (
                          <div key={i} className="bet-category">
                            <h5>{cat.category}</h5>
                            <div className="pill-container">
                              {cat.choices.map((c, j) => {
                                const selected = isChoiceSelected(ub, cat.category, c.name);
                                return (
                                  <div
                                    key={j}
                                    className={`pill ${selected ? 'selected' : ''}`}
                                  >
                                    {c.name}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {/* Show Finished Bets (History) */}
      {activePage === 'history' && (
        <>
          {finishedBets.length === 0 ? (
            <p>אין הימורים היסטוריים.</p>
          ) : (
            finishedBets.map((ub) => {
              const series = ub.seriesId;
              const betId = ub._id;
              const isExpanded = !!expanded[betId];

              return (
                <div
                  key={betId}
                  className="mybet-card"
                  onClick={() => toggleExpand(betId)}
                >
                  {/* Collapsed View */}
                  {!isExpanded && (
                    <div className="mybet-header">
                      <div className="left-logos">
                        <TeamLogo teamName={series.teamA} className="big-logo" />
                        <TeamLogo teamName={series.teamB} className="big-logo" />
                      </div>
                      <div className="right-column">
                        <span className="bet-status">הימור הסתיים</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Pink Panel - read-only form style */}
                  {isExpanded && (
                    <div className="mybet-expanded">
                      <div className="top-bar">
                        <div className="top-bar-center">
                          <span className="bet-status">הימור הסתיים</span>
                        </div>
                        <FaTimes
                          className="close-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(betId);
                          }}
                        />
                      </div>

                      <div className="teams-row">
                        <TeamLogo teamName={series.teamA} className="team-logo" />
                        <span className="teams-dash">-</span>
                        <TeamLogo teamName={series.teamB} className="team-logo" />
                      </div>

                      <div className="bet-details-pill">
                        {series.betOptions.map((cat, i) => (
                          <div key={i} className="bet-category">
                            <h5>{cat.category}</h5>
                            <div className="pill-container">
                              {cat.choices.map((c, j) => {
                                const selected = isChoiceSelected(ub, cat.category, c.name);
                                return (
                                  <div
                                    key={j}
                                    className={`pill ${selected ? 'selected' : ''}`}
                                  >
                                    {c.name}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

export default MyBetsPage;
