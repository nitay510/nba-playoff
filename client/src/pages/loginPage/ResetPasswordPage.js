import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Background from '../../components/Login-back';
import './LoginPage.scss';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [msg,       setMsg]       = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) setError('קישור לא תקין. בקש קישור חדש.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');

    if (password !== password2) { setError('הסיסמאות אינן תואמות'); return; }
    if (password.length < 6)    { setError('סיסמה חייבת להכיל לפחות 6 תווים'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.msg);
        setTimeout(() => navigate('/'), 2500);
      } else {
        setError(data.msg || 'שגיאה');
      }
    } catch {
      setError('שגיאה בהתחברות לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container login-container">
      <Background image="open-screen.png" />
      <h2 className="title-small">איפוס סיסמה</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <label>סיסמה חדשה</label>
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

        {msg   && <p style={{ color: '#4caf50', textAlign: 'center', fontSize: '0.9rem' }}>{msg}</p>}
        {error && <p className="error-msg">{error}</p>}

        <button type="submit" disabled={loading || !token}>
          {loading ? 'מעדכן...' : 'עדכן סיסמה'}
        </button>

        <div className="register-container2" style={{ marginTop: '0.75rem' }}>
          <Link to="/" className="forgot-link">חזרה להתחברות</Link>
        </div>
      </form>
    </div>
  );
}
