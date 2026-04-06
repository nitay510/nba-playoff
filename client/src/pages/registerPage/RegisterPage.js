import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.scss';
import Background from '../../components/Login-back';

function RegisterPage() {
  const navigate = useNavigate();
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [errorMsg,  setErrorMsg]  = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== password2) { setErrorMsg('הסיסמאות אינן תואמות'); return; }

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) { setErrorMsg(data.msg || 'שגיאה בהרשמה'); return; }

      // Auto-login after successful registration
      const loginRes  = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem('username', loginData.username);
        loginData.username === 'nitay510' ? navigate('/admin') : navigate('/choose-champion');
      } else {
        setErrorMsg(loginData.msg || 'שגיאה בהתחברות');
      }
    } catch {
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
          required
        />

        <label>אימייל</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="נדרש לשחזור סיסמה"
          required
        />

        <label>סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="לפחות 6 תווים"
          required
        />

        <label>אימות סיסמה</label>
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          placeholder="הכנס שוב את הסיסמה"
          required
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
