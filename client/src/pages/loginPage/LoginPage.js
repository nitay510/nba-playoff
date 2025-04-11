import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Background from '../../components/Login-back';
import WelcomePopup from '../../components/WelcomePopup';
import './LoginPage.scss';

function LoginPage() {
  const navigate = useNavigate();

  /* form state */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  /********************************************************
   * AUTO‑LOGIN
   * ------------------------------------------------------
   * – on component mount we look for a saved username
   *   in localStorage (saved after a successful login).
   * – if found → skip the form and redirect immediately.
   * – JWT cookie that you already set on the server will
   *   still be sent with every fetch, so protected routes
   *   remain secure. This step only hides the login page.
   ********************************************************/
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (!savedUser) return;                    // first visit → show form

    if (savedUser === 'nitay510') navigate('/admin');
    else navigate('/home');
  }, [navigate]);

  /* normal login flow */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/auth/login',
        {
          method: 'POST',
          credentials: 'include', // keeps the JWT cookie
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('username', data.username);

        if (data.username === 'nitay510') navigate('/admin');
        else navigate('/home');
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

      {/* first‑visit welcome pop‑up */}
      <WelcomePopup />

      <h2 className="title-small">התחברות</h2>

      <form onSubmit={handleLogin} className="login-form">
        <label>שם משתמש</label>
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
