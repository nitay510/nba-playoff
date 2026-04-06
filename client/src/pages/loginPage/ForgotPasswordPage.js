import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Background from '../../components/Login-back';
import './LoginPage.scss';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setMsg(data.msg);
      else setError(data.msg || 'שגיאה');
    } catch {
      setError('שגיאה בהתחברות לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container login-container">
      <Background image="open-screen.png" />
      <h2 className="title-small">שכחתי סיסמה</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <label>אימייל</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="הכנס את האימייל שלך"
          required
        />

        {msg   && <p style={{ color: '#4caf50', textAlign: 'center', fontSize: '0.9rem' }}>{msg}</p>}
        {error && <p className="error-msg">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
        </button>

        <div className="register-container2" style={{ marginTop: '0.75rem' }}>
          <Link to="/" className="forgot-link">חזרה להתחברות</Link>
        </div>
      </form>
    </div>
  );
}
