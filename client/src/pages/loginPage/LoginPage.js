import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Background from '../../components/Login-back';
import './LoginPage.scss';

function LoginPage() {
  const navigate = useNavigate();

  /* form state */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  /********************************************************
   * SMART AUTO‑LOGIN
   * ------------------------------------------------------
   * 1. Look for username in localStorage.
   * 2. Ping /api/auth/me to be sure the JWT cookie is
   *    still valid.  If not → clean localStorage.
   ********************************************************/
  useEffect(() => {
    /* 1) tutorial not seen? go to /welcome */
    if (!localStorage.getItem('tutorialSeen')) {
      navigate('/welcome');
      return;
    }
  
    /* 2) auto‑login check (unchanged) */
    const savedUser = localStorage.getItem('username');
    if (!savedUser) return;
  
    fetch('https://nba-playoff-eyd5.onrender.com/api/auth/me', {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !data.username) {
          localStorage.removeItem('username');
          return;
        }
        data.username === 'nitay510' ? navigate('/admin') : navigate('/home');
      })
      .catch(() => localStorage.removeItem('username'));
  }, [navigate]);

  /* normal login flow */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('username', data.username);
        data.username === 'nitay510' ? navigate('/admin') : navigate('/home');
      } else {
        setErrorMsg(data.msg || 'שגיאה בהתחברות');
      }
    } catch {
      setErrorMsg('שגיאה בהתחברות לשרת');
    }
  };

  return (
    <div className="main-container login-container">
      <Background image="open-screen.png" />



      <h2 className="title-small">התחברות</h2>

      <form onSubmit={handleLogin} className="login-form">
        <label>שם משתמש/אימייל</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <button type="submit">התחבר</button>

        <div className="register-container2">
          <p className="register-text">עדיין אין לך חשבון?</p>
          <Link to="/register" className="register-link">
            הירשם עכשיו
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
