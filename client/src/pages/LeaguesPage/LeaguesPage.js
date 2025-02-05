import React, { useEffect, useState } from 'react';
import CreateLeagueModal from './CreateLeagueModal';
import JoinLeagueModal from './JoinLeagueModal';
import { useNavigate } from 'react-router-dom';
import './LeaguesPage.scss';

function LeaguesPage() {
    const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchMyLeagues();
  }, []);

  const fetchMyLeagues = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leagues/mine', {
        credentials: 'include',
      });
      const data = await res.json();
      setLeagues(data);
    } catch (error) {
      console.error('Error fetching my leagues:', error);
    }
  };

  const onCreateLeagueSuccess = () => {
    setShowCreateModal(false);
    fetchMyLeagues();
  };

  const onJoinLeagueSuccess = () => {
    setShowJoinModal(false);
    fetchMyLeagues();
  };

  return (
    <div className="leagues-page container">
      <h2>הליגות שלי</h2>
      <button onClick={() => setShowCreateModal(true)}>צור ליגה חדשה</button>
      <button onClick={() => setShowJoinModal(true)}>הצטרף לליגה עם קוד</button>

      <div className="league-list">
        {leagues.length === 0 && <p>אינך חבר בשום ליגה עדיין.</p>}
        {leagues.map((lg) => (
  <div key={lg._id} className="league-card">
    <h3>{lg.name}</h3>
    <p>קוד ליגה: {lg.code}</p>
    <p>מספר משתתפים: {lg.members.length}</p>
    <button onClick={() => navigate(`/leagues/${lg._id}/leaderboard`)}>
      צפה בטבלת ניקוד
    </button>
  </div>
))}
      </div>

      {showCreateModal && (
        <CreateLeagueModal
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={onCreateLeagueSuccess}
        />
      )}

      {showJoinModal && (
        <JoinLeagueModal
          onClose={() => setShowJoinModal(false)}
          onJoinSuccess={onJoinLeagueSuccess}
        />
      )}
    </div>
  );
}

export default LeaguesPage;
