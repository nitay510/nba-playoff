import React, { useEffect, useState } from 'react';
import Background from '../../components/Login-back';
import TeamLogo from '../../components/TeamLogo';
import { calculateSeriesPoints } from '../../utils/points';
import { FaTimes } from 'react-icons/fa';
import './MyBetsPage.scss';
import Header2 from '../../components/Header2';

function MyBetsPage() {
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({}); // track expanded panels
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

  // Check if user SELECTED a given choice
  const isChoiceSelected = (ub, category, choiceName) => {
    const catBet = ub.bets.find((b) => b.category === category);
    if (!catBet) return false;

    // If "בכמה משחקים", compare numeric parts
    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catBet.choiceName) === extractNumbers(choiceName);
    }
    return catBet.choiceName === choiceName;
  };

  // Check if a given choiceName is the ACTUAL finalChoice
  const isChoiceActual = (series, category, choiceName) => {
    const catSeries = series.betOptions.find((o) => o.category === category);
    if (!catSeries || !catSeries.finalChoice) return false;

    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catSeries.finalChoice) === extractNumbers(choiceName);
    }
    return catSeries.finalChoice === choiceName;
  };

  // For debug + correctness: user vs finalChoice
  const isCategoryCorrect = (ub, category) => {
    const catBet = ub.bets.find((b) => b.category === category);
    const catSeries = ub.seriesId?.betOptions?.find((o) => o.category === category);
    if (!catBet || !catSeries) return false;

    console.log('Category:', category);
    console.log('Series finalChoice:', catSeries.finalChoice);
    console.log('User choice:', catBet.choiceName);

    return catSeries.finalChoice && catSeries.finalChoice === catBet.choiceName;
  };

  return (
    <div className="my-bets-page">
      <Background image="background2.png" />
      <Header2 />

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

      {/* Active Bets */}
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
                  {/* Collapsed */}
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

                  {/* Expanded */}
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

      {/* History Bets */}
      {activePage === 'history' && (
        <>
          {finishedBets.length === 0 ? (
            <p>אין הימורים היסטוריים.</p>
          ) : (
            finishedBets.map((ub) => {
              const series = ub.seriesId;
              const betId = ub._id;
              const isExpanded = !!expanded[betId];
              // total points from this series
              const pointsFromSeries = calculateSeriesPoints(ub, series);

              // For the color styling (green if > 0, red if 0 or negative)
              const pointsColor = pointsFromSeries > 0 ? 'green' : 'red';

              return (
                <div
                  key={betId}
                  className="mybet-card"
                  onClick={() => toggleExpand(betId)}
                >
                  {/* Collapsed */}
                  {!isExpanded && (
                    <div className="mybet-header">
                      <div className="left-logos">
                        <TeamLogo teamName={series.teamA} className="big-logo" />
                        <TeamLogo teamName={series.teamB} className="big-logo" />
                      </div>
                      <div className="right-column">
                        <span className="bet-status">הימור הסתיים</span>
                        {/* Show points from series in the collapsed too, colored */}
                        <span style={{ color: pointsColor }}>
                          {pointsFromSeries}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expanded => final results */}
                  {isExpanded && (
                    <div className="mybet-expanded">
                      <div className="top-bar">
                        <div className="top-bar-center">
                          <span className="bet-status">הימור הסתיים</span>
                          {/* show points from series in top bar */}
                          <span style={{ color: pointsColor, marginLeft: '0.5rem' }}>
                            {pointsFromSeries}
                          </span>
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
                        {series.betOptions.map((cat, i) => {
                          const userCorrect = isCategoryCorrect(ub, cat.category);

                          return (
                            <div key={i} className="bet-category">
                              <h5>
                                {cat.category}{' '}
                                {userCorrect ? (
                                  <span className="correct-icon">✔</span>
                                ) : (
                                  <span className="wrong-icon">✘</span>
                                )}
                              </h5>

                              <div className="pill-container">
                                {cat.choices.map((c, j) => {
                                  const isUserPick = isChoiceSelected(ub, cat.category, c.name);
                                  const isActualPick = isChoiceActual(series, cat.category, c.name);

                                  let pillClass = 'pill';
                                  if (isActualPick) pillClass += ' actual';
                                  if (isUserPick) pillClass += ' selected';
                                  return (
                                    <div key={j} className={pillClass}>
                                      {c.name}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
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
