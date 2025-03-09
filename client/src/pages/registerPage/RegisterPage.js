import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.scss';
import Background from '../../components/Login-back';

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Automatically log in the user after registration
        handleLogin();
      } else {
        setErrorMsg(data.msg || 'שגיאה בהרשמה');
      }
    } catch (error) {
      setErrorMsg('שגיאה בהתחברות לשרת');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store username (so ChampionSelectionPage can retrieve it)
        localStorage.setItem('username', data.username);

        if (data.username === 'nitay510') {
          navigate('/admin');
        } else {
          // Instead of /home, go to /choose-champion
          navigate('/choose-champion');
        }
      } else {
        setErrorMsg(data.msg || 'שגיאה בהתחברות');
      }
    } catch (error) {
      setErrorMsg('שגיאה בהתחברות לשרת');
    }
  };

  return (
    <div className="main-container register-container">
      <Background image="open-screen.png" />
      <h2 className="title-small">הרשמה</h2>
      <form onSubmit={handleRegister} className="register-form">
        <label>שם משתמש</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>אימייל</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <button type="submit">הירשם</button>
      </form>

      <div className="login-container">
        <p className="login-text">כבר רשום?</p>
        <Link to="/" className="login-link">התחבר עכשיו</Link>
      </div>
    </div>
  );
}

export default RegisterPage;
