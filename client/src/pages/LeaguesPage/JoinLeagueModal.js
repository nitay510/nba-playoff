import React, { useState } from 'react';
import './JoinLeagueModal.scss';

function JoinLeagueModal({ onClose, onJoinSuccess }) {
  const [code, setCode] = useState('');

  const handleJoin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leagues/join', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || 'Failed to join league');
        return;
      }
      alert(`הצטרפת לליגה: ${data.name}`);
      onJoinSuccess();
    } catch (error) {
      console.error('Join league error:', error);
    }
  };

  return (
    <div className="join-league-modal-overlay">
      <div className="join-league-modal">
        <h3>הצטרף לליגה עם קוד</h3>
        <label>קוד ליגה:</label>
        <input
          type="text"
          placeholder="לדוגמה: ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleJoin}>הצטרף</button>
          <button onClick={onClose}>בטל</button>
        </div>
      </div>
    </div>
  );
}

export default JoinLeagueModal;
