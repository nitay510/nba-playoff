import React, { useEffect, useState } from 'react';
import Background from '../../components/Login-back';
import TeamLogo from '../../components/TeamLogo';
import { calculateSeriesPoints } from '../../utils/points';
import { FaTimes } from 'react-icons/fa';
import './MyBetsPage.scss';
import Header from '../../components/Header';

function MyBetsPage() {
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [activePage, setActivePage] = useState('active');

  useEffect(() => {
    fetchAllUserBets();
  }, []);

  const fetchAllUserBets = async () => {
    try {
      const res = await fetch('https://nba-playoff-eyd5.onrender.com/api/user-bets/all', {
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

  // Separate active and finished
  const activeBets = userBets.filter(
    (ub) => ub.seriesId && !ub.seriesId.isFinished && ub.seriesId.isLocked
  );
  const finishedBets = userBets.filter(
    (ub) => ub.seriesId && ub.seriesId.isFinished && ub.seriesId.isLocked
  );

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  // Return true if user SELECTED this choice
  const isChoiceSelected = (ub, category, choiceName) => {
    const catBet = ub.bets.find((b) => b.category === category);
    if (!catBet) return false;

    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catBet.choiceName) === extractNumbers(choiceName);
    }
    return catBet.choiceName === choiceName;
  };

  // Return true if this choice is the ACTUAL final choice
  const isChoiceActual = (series, category, choiceName) => {
    const catSeries = series.betOptions.find((o) => o.category === category);
    if (!catSeries || !catSeries.finalChoice) return false;

    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catSeries.finalChoice) === extractNumbers(choiceName);
    }
    return catSeries.finalChoice === choiceName;
  };

  // Return true if user guessed category correctly
  const isCategoryCorrect = (ub, category) => {
    const catBet = ub.bets.find((b) => b.category === category);
    const catSeries = ub.seriesId?.betOptions?.find((o) => o.category === category);
    if (!catBet || !catSeries) return false;

    return catSeries.finalChoice && catSeries.finalChoice === catBet.choiceName;
  };

  // Format series points with a plus sign if > 0
  const formatPoints = (points) => (points > 0 ? `${points}+` : `${points}`);

  return (
    <div className="my-bets-page">
      <Background image="background2.png" />
      <Header />

      <div className="page-con">
        <h2>הניחושים שלי</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

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
              <p style={{ marginRight: '2rem' }}>אין ניחושים פעילים.</p>
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
                      <div className="mybet-header reversed-header">
                        {/* left side => two lines: 
                             1) "סטאטוס ניחוש"
                             2) "ניחוש פעיל" */}
                        <div className="left-column active-left">
                          <span className="status-title">סטאטוס ניחוש</span>
                          <span className="bet-status">ניחוש פעיל</span>
                        </div>

                        {/* right side => two team logos */}
                        <div className="right-logos">
                          <TeamLogo teamName={series.teamA} className="big-logo" />
                          <TeamLogo teamName={series.teamB} className="big-logo" />
                        </div>
                      </div>
                    )}

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="mybet-expanded">
                        <div className="top-bar">
                          <div className="top-bar-center">
                            <span className="bet-status">ניחוש פעיל</span>
                          </div>
                          <FaTimes
                            className="close-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(betId);
                            }}
                          />
                        </div>

                        <div className="teams-row reversed-row">
                          <TeamLogo teamName={series.teamB} className="team-logo" />
                          <span className="teams-dash">-</span>
                          <TeamLogo teamName={series.teamA} className="team-logo" />
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
              <p style={{ marginRight: '2rem' }}>אין ניחושים היסטוריים.</p>
            ) : (
              finishedBets.map((ub) => {
                const series = ub.seriesId;
                const betId = ub._id;
                const isExpanded = !!expanded[betId];

                // get points + color
                const pointsFromSeries = calculateSeriesPoints(ub, series);
                const pointsString = formatPoints(pointsFromSeries);
                const pointsColor = pointsFromSeries > 0 ? 'rgba(100, 206, 112, 1)' : 'rgba(238, 63, 63, 1)';

                // 1) Set border color based on points (green/red):
                const borderStyle = { border: `2px solid ${pointsColor}` };

                return (
                  <div
                    key={betId}
                    className="mybet-card"
                    onClick={() => toggleExpand(betId)}
                    style={borderStyle} // apply the border color here
                  >
                    {/* Collapsed */}
                    {!isExpanded && (
                      <div className="mybet-header reversed-header">
                        {/* left side => "סטאטוס ניחוש" and points side-by-side */}
                        <div className="left-column history-left">
                          <span className="bet-status">סטאטוס ניחוש</span>
                          <span className="bet-points" style={{ color: pointsColor }}>
                            {pointsString}
                          </span>
                        </div>

                        {/* right side => two team logos */}
                        <div className="right-logos">
                          <TeamLogo teamName={series.teamA} className="big-logo" />
                          <TeamLogo teamName={series.teamB} className="big-logo" />
                        </div>
                      </div>
                    )}

                    {/* Expanded => final results */}
                    {isExpanded && (
                      <div className="mybet-expanded">
                        <div className="top-bar">
                          <div className="top-bar-center">
                            <span className="bet-status">ניחוש הסתיים</span>
                            <span
                              className="bet-points"
                              style={{ color: pointsColor, marginLeft: '0.5rem' }}
                            >
                              {pointsString}
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

                        <div className="teams-row reversed-row">
                          <TeamLogo teamName={series.teamB} className="team-logo" />
                          <span className="teams-dash">-</span>
                          <TeamLogo teamName={series.teamA} className="team-logo" />
                        </div>

                        <div className="bet-details-pill">
                          {series.betOptions.map((cat, i) => {
                            const userCorrect = isCategoryCorrect(ub, cat.category);

                            return (
                              <div key={i} className="bet-category">
                                <h5>
                                  {/* 2) update the V / X to better icons or style */}
                                  {userCorrect ? (
                                    <span className="my-check-icon">✓</span> // changed from &#10003;
                                  ) : (
                                    <span className="my-x-icon">✗</span> // changed from &#10007;
                                  )}{' '}
                                  {cat.category}
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
    </div>
  );
}

export default MyBetsPage;
