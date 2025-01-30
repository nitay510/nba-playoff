import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.scss';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Save username in local storage
        localStorage.setItem('username', data.username);
  
        // Check if it's nitay510
        if (data.username === 'nitay510') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        setErrorMsg(data.msg || 'שגיאה בהתחברות');
      }
    } catch (error) {
      setErrorMsg('שגיאה בהתחברות לשרת');
    }
  };

  return (
    <div className="main-container login-container">
      <h1 className="title">התחברות</h1>
      <form onSubmit={handleLogin} className="login-form">
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

        <button type="submit">התחבר</button>
      </form>

      <div className="register-link">
        <p>עדיין אין לך חשבון?</p>
        <Link to="/register">להירשם עכשיו</Link>
      </div>
    </div>
  );
}

export default LoginPage;
