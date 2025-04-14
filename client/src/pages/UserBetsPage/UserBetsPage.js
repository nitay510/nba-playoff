import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from '../../components/Login-back';
import TeamLogo from '../../components/TeamLogo';
import { calculateSeriesPoints } from '../../utils/points';
import { FaTimes } from 'react-icons/fa';
import './UserBetsPage.scss';
import Header from '../../components/Header';

function UserBetsPage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [bets, setBets] = useState([]);
  const [champion, setChampion] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [activePage, setActivePage] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    fetchUserBets();
  }, [username]);

  const fetchUserBets = async () => {
    try {
      const res = await fetch(`https://nba-playoff-eyd5.onrender.com/api/user-bets/user/${username}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to fetch user bets');
      }
      const data = await res.json();
      // data => { champions, bets }
      setChampion(data.champions || '');
      setBets(Array.isArray(data.bets) ? data.bets : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Separate active and finished bets
  const activeBets = bets.filter(
    (ub) => ub.seriesId && !ub.seriesId.isFinished && ub.seriesId.isLocked
  );
  const finishedBets = bets.filter(
    (ub) => ub.seriesId && ub.seriesId.isFinished && ub.seriesId.isLocked
  );

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  // Helper: is user’s choice selected?
  const isChoiceSelected = (ub, category, choiceName) => {
    const catBet = ub.bets.find((b) => b.category === category);
    if (!catBet) return false;

    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catBet.choiceName) === extractNumbers(choiceName);
    }
    return catBet.choiceName === choiceName;
  };

  // Helper: is this choice the actual final choice?
  const isChoiceActual = (series, category, choiceName) => {
    const catSeries = series.betOptions.find((o) => o.category === category);
    if (!catSeries || !catSeries.finalChoice) return false;

    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catSeries.finalChoice) === extractNumbers(choiceName);
    }
    return catSeries.finalChoice === choiceName;
  };

  // Helper: is user correct in a category?
  const isCategoryCorrect = (ub, category) => {
    const catBet = ub.bets.find((b) => b.category === category);
    const catSeries = ub.seriesId?.betOptions?.find((o) => o.category === category);
    if (!catBet || !catSeries) return false;

    return catSeries.finalChoice && catSeries.finalChoice === catBet.choiceName;
  };

  // Show plus sign if points > 0
  const formatPoints = (points) => (points > 0 ? `${points}+` : `${points}`);

  return (
    <div className="user-bets-page">
      <div className="page-con">
        <Background image="background2.png" />
        <Header />

        <div className="user-bets-header">
          <span className="arrow-left" onClick={() => navigate(-1)}>
            &#8249;
          </span>
          <h2>הניחושים של {username}</h2>
        </div>

        {champion && (
          <p className="champion-pick">
            ניחוש אלופה: <strong>{champion}</strong>
          </p>
        )}

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
                    className="userbet-card"
                    onClick={() => toggleExpand(betId)}
                  >
                    {/* Collapsed => reversed layout, two-line left column */}
                    {!isExpanded && (
                      <div className="userbet-header reversed-header">
                        <div className="left-column active-left">
                          <span className="status-title">סטאטוס ניחוש</span>
                          <span className="bet-status">ניחוש פעיל</span>
                        </div>
                        <div className="right-logos">
                          <TeamLogo teamName={series.teamA} className="big-logo" />
                          <TeamLogo teamName={series.teamB} className="big-logo" />
                        </div>
                      </div>
                    )}

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="userbet-expanded">
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

                // Calculate points, color
                const pointsFromSeries = calculateSeriesPoints(ub, series);
                const pointsString = formatPoints(pointsFromSeries);
                const pointsColor = pointsFromSeries > 0 ? 'rgba(100, 206, 112, 1)' : 'rgba(238, 63, 63, 1)';

                // 1) Add border color for finished bets
                const borderStyle = { border: `2px solid ${pointsColor}` };

                return (
                  <div
                    key={betId}
                    className="userbet-card"
                    onClick={() => toggleExpand(betId)}
                    style={borderStyle} // apply the green/red border
                  >
                    {/* Collapsed => "סטאטוס ניחוש" + points */}
                    {!isExpanded && (
                      <div className="userbet-header reversed-header">
                        <div className="left-column history-left">
                          <span className="bet-status">סטאטוס ניחוש</span>
                          <span className="bet-points" style={{ color: pointsColor }}>
                            {pointsString}
                          </span>
                        </div>
                        <div className="right-logos">
                          <TeamLogo teamName={series.teamA} className="big-logo" />
                          <TeamLogo teamName={series.teamB} className="big-logo" />
                        </div>
                      </div>
                    )}

                    {/* Expanded => final results */}
                    {isExpanded && (
                      <div className="userbet-expanded">
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
                                  {/* 2) Updated V/X icons */}
                                  {userCorrect ? (
                                    <span className="my-check-icon">✓</span>
                                  ) : (
                                    <span className="my-x-icon">✗</span>
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

export default UserBetsPage;
