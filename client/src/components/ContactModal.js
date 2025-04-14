import React, { useState } from 'react';
import './ContactModal.scss';

function ContactModal({ onClose }) {
  const username = localStorage.getItem('username') || '';

  const [subject, setSubject]   = useState('');
  const [message, setMessage]   = useState('');
  const [sent,    setSent]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, subject, message }),
        }
      );
      if (res.ok) setSent(true);
      else alert('שגיאה בשליחה');
    } catch {
      alert('שגיאה בשליחה');
    }
  };

  return (
    <div className="contact-backdrop" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        {sent ? (
          <p className="thank-you">ההודעה נשמרה, תודה!</p>
        ) : (
          <>
            <h3>צור קשר</h3>
            <form onSubmit={handleSubmit}>
              <label>שם משתמש</label>
              <input type="text" value={username} disabled />

              <label>נושא</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <label>תיאור</label>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <button className="send-btn" type="submit">שלח</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ContactModal;
