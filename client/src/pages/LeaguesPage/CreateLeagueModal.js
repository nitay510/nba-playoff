import React, { useState } from 'react';
import './CreateLeagueModal.scss';

function CreateLeagueModal({ onClose, onCreateSuccess }) {
  const [name, setName] = useState('');

  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leagues/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || 'Failed to create league');
        return;
      }
      // success
      alert(`ליגה נוצרה בהצלחה! קוד ליגה: ${data.code}`);
      onCreateSuccess();
    } catch (error) {
      console.error('Create league error:', error);
    }
  };

  return (
    <div className="create-league-modal-overlay">
      <div className="create-league-modal">
        <h3>צור ליגה חדשה</h3>
        <label>שם ליגה:</label>
        <input
          type="text"
          placeholder="לדוגמה: ליגת החברים"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleCreate}>צור ליגה</button>
          <button onClick={onClose}>בטל</button>
        </div>
      </div>
    </div>
  );
}

export default CreateLeagueModal;
