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
  const [champion, setChampion] = useState(''); // store user's champion
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [activePage, setActivePage] = useState('active'); // or 'history'

  useEffect(() => {
    fetchUserBets();
  }, [username]);

  const fetchUserBets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user-bets/user/${username}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to fetch user bets');
      }
      const data = await res.json();
      // We assume data = { champions, bets }
      setChampion(data.champions || '');
      setBets(Array.isArray(data.bets) ? data.bets : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const activeBets = bets.filter(
    (ub) => ub.seriesId && !ub.seriesId.isFinished && ub.seriesId.isLocked
  );
  const finishedBets = bets.filter(
    (ub) => ub.seriesId && ub.seriesId.isFinished && ub.seriesId.isLocked
  );

  const toggleExpand = (betId) => {
    setExpanded((prev) => ({ ...prev, [betId]: !prev[betId] }));
  };

  // isChoiceSelected => highlight user pick
  const isChoiceSelected = (ub, category, choiceName) => {
    const catBet = ub.bets.find((b) => b.category === category);
    if (!catBet) return false;
    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catBet.choiceName) === extractNumbers(choiceName);
    }
    return catBet.choiceName === choiceName;
  };

  // isChoiceActual => highlight correct final choice
  const isChoiceActual = (series, category, choiceName) => {
    const catSeries = series.betOptions.find((o) => o.category === category);
    if (!catSeries || !catSeries.finalChoice) return false;
    if (category === 'בכמה משחקים') {
      const extractNumbers = (str) => str.match(/\d+/g)?.join('') || '';
      return extractNumbers(catSeries.finalChoice) === extractNumbers(choiceName);
    }
    return catSeries.finalChoice === choiceName;
  };

  // check if user got that category correct
  const isCategoryCorrect = (ub, category) => {
    const catBet = ub.bets.find((b) => b.category === category);
    const catSeries = ub.seriesId?.betOptions?.find((o) => o.category === category);
    if (!catBet || !catSeries) return false;

    return catSeries.finalChoice && catSeries.finalChoice === catBet.choiceName;
  };

  // format series points with plus sign if > 0
  const formatPoints = (points) => {
    if (points > 0) return `+${points}`;
    return `${points}`;
  };

  return (
    <div className="user-bets-page">
      <Background image="background2.png" />
      <Header />

      <div className="user-bets-header">
        {/* arrow left => navigate(-1) */}
        <span className="arrow-left" onClick={() => navigate(-1)}>
          &#8249; 
        </span>
        {/* Title with username */}
        <h2>ההימורים של {username}</h2>
      </div>

      {/* Show champion pick below the username */}
      {champion && (
        <p className="champion-pick">
          הימור אלופה: <strong>{champion}</strong>
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
            <p>אין הימורים פעילים.</p>
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
                  {/* Collapsed */}
                  {!isExpanded && (
                    <div className="userbet-header">
                      <div className="left-logos">
                        <TeamLogo teamName={series.teamA} className="big-logo" />
                        <TeamLogo teamName={series.teamB} className="big-logo" />
                      </div>
                      <div className="right-column">
                        {/* Status + no points for active */}
                        <span className="bet-status">הימור פעיל</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="userbet-expanded">
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
              // with plus sign if > 0
              const pointsString = formatPoints(pointsFromSeries);

              return (
                <div
                  key={betId}
                  className="userbet-card"
                  onClick={() => toggleExpand(betId)}
                >
                  {/* Collapsed */}
                  {!isExpanded && (
                    <div className="userbet-header">
                      <div className="left-logos">
                        <TeamLogo teamName={series.teamA} className="big-logo" />
                        <TeamLogo teamName={series.teamB} className="big-logo" />
                      </div>
                      <div className="right-column">
                        {/* status + points next to each other */}
                        <span className="bet-status">הימור הסתיים</span>
                        <span className="bet-points" style={{ color: pointsFromSeries > 0 ? 'green' : 'red' }}>
                          {pointsString}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expanded => final results */}
                  {isExpanded && (
                    <div className="userbet-expanded">
                      <div className="top-bar">
                        <div className="top-bar-center">
                          <span className="bet-status">הימור הסתיים</span>
                          <span
                            className="bet-points"
                            style={{ color: pointsFromSeries > 0 ? 'green' : 'red', marginLeft: '0.5rem' }}
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
                              {/* move icons to left side => we do them before the category name */}
                              <h5>
                                {userCorrect ? (
                                  <span className="my-check-icon">&#10003;</span>
                                ) : (
                                  <span className="my-x-icon">&#10007;</span>
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
  );
}

export default UserBetsPage;
