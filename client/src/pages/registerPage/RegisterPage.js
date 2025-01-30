import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.scss';

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Go to login after successful register
        navigate('/home');
      } else {
        setErrorMsg(data.msg || 'שגיאה בהרשמה');
      }
    } catch (error) {
      setErrorMsg('שגיאה בהתחברות לשרת');
    }
  };

  return (
    <div className="main-container register-container">
      <h1 className="title">הרשמה</h1>
      <form onSubmit={handleRegister} className="register-form">
        <label>שם משתמש</label>
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>סיסמה</label>
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <button type="submit">הירשם</button>
      </form>

      <div className="login-link">
        <p>כבר רשום?</p>
        <Link to="/login">התחבר עכשיו</Link>
      </div>
    </div>
  );
}

export default RegisterPage;
