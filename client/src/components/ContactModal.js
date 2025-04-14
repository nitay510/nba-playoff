import React, { useState } from 'react';
import './ContactModal.scss';

function ContactModal({ onClose }) {
  const storedUser = localStorage.getItem('username') || '';

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  /* build a mailto link and open the user’s e‑mail client */
  const handleSubmit = (e) => {
    e.preventDefault();

    const mailSubject = `${subject || 'פנייה חדשה'}  |  ${storedUser}`;
    const body =
      `שם משתמש: ${storedUser}\n\n` +
      `-----------------------------\n` +
      `${message}`;

    const mailto = `mailto:nitay510@gmail.com?subject=${encodeURIComponent(
      mailSubject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    onClose(); // close modal
  };

  return (
    <div className="contact-backdrop" onClick={onClose}>
      <div
        className="contact-modal"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click
      >
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h3>צור קשר</h3>
        <form onSubmit={handleSubmit}>
          <label>שם משתמש</label>
          <input type="text" value={storedUser} disabled />

          <label>נושא</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="למשל: בעיה בדף ההימורים"
            required
          />

          <label>תיאור הבעיה / שאלה</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            required
          />

          <button type="submit" className="send-btn">
            שלח
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;
