import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePopup.scss';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const navigate        = useNavigate();

  /*  ── show only on the first visit ───────────────────────── */
  useEffect(() => {
    if (!localStorage.getItem('welcome‑seen')) setShow(true);
  }, []);

  const close = () => {
    localStorage.setItem('welcome‑seen', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="welcome‑overlay" onClick={close}>
      <div className="welcome‑box" onClick={e => e.stopPropagation()}>
        <button className="close‑btn" onClick={close}>×</button>

        <h2>ברוכים הבאים ל‑NBA Playoff League!</h2>

        <p>
          • נרשמים, בוחרים אלופה ומהמרים על כל סדרה.<br/>
          • צוברים נקודות ומתחרים בחברים בליגות פרטיות.<br/>
        </p>

        <button
          className="register‑btn"
          onClick={() => {
            close();
            navigate('/register');
          }}
        >
          להרשמה מהירה
        </button>
      </div>
    </div>
  );
}
