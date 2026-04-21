import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUserBetsPage.scss';

/* ── Single series bet editor for one user ── */
function SeriesBetEditor({ series, userBet, onSave }) {
  const [choices, setChoices] = useState(() => {
    const map = {};
    for (const b of (userBet?.bets || [])) {
      map[b.category] = b.choiceName;
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState('');

  const handleChange = (category, choiceName) => {
    setChoices((prev) => ({ ...prev, [category]: choiceName }));
    setMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const bets = series.betOptions.map((opt) => ({
        category:       opt.category,
        choiceName:     choices[opt.category] || '',
        oddsWhenPlaced: opt.choices.find((c) => c.name === choices[opt.category])?.odds || 1,
      })).filter((b) => b.choiceName);

      const res = await fetch('/api/bets/admin/override', {
        method:      'PUT',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: onSave.userId, seriesId: series._id, bets }),
      });
      const d = await res.json();
      setMsg(res.ok ? '✓ נשמר' : `✗ ${d.msg}`);
    } catch (e) {
      setMsg('✗ שגיאת רשת');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sbe-card">
      <div className="sbe-title">
        {series.teamA} נגד {series.teamB}
        {series.round && <span className="sbe-round">{series.round}</span>}
        {series.isLocked && <span className="sbe-locked">🔒</span>}
      </div>

      {series.betOptions.map((opt) => (
        <div key={opt.category} className="sbe-row">
          <label className="sbe-cat">{opt.category}</label>
          <select
            value={choices[opt.category] || ''}
            onChange={(e) => handleChange(opt.category, e.target.value)}
          >
            <option value="">— לא הימר —</option>
            {opt.choices.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.odds}x)
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="sbe-footer">
        {msg && <span className={msg.startsWith('✓') ? 'sbe-ok' : 'sbe-err'}>{msg}</span>}
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </div>
  );
}

/* ── User detail view ── */
function UserBetsEditor({ user, onBack }) {
  const [seriesList, setSeriesList] = useState([]);
  const [userBets,   setUserBets]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, bRes] = await Promise.all([
          fetch('/api/series',                             { credentials: 'include' }),
          fetch(`/api/bets/user/${user.username}`,         { credentials: 'include' }),
        ]);
        const series = await sRes.json();
        const bData  = await bRes.json();

        setSeriesList(series.filter((s) => !s.isFinished));
        setUserBets(bData.bets || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <p className="aub-loading">טוען...</p>;

  return (
    <div className="aub-editor">
      <button className="aub-back" onClick={onBack}>← חזור לרשימה</button>
      <h3 className="aub-user-title">ניחושי {user.username}</h3>
      <p className="aub-points">נקודות: {user.points ?? 0}</p>

      {seriesList.length === 0 ? (
        <p className="aub-empty">אין סדרות פעילות כרגע.</p>
      ) : (
        seriesList.map((series) => {
          const userBet = userBets.find(
            (ub) => (ub.seriesId?._id || ub.seriesId) === series._id
          );
          return (
            <SeriesBetEditor
              key={series._id}
              series={series}
              userBet={userBet}
              onSave={{ userId: user._id }}
            />
          );
        })
      )}
    </div>
  );
}

/* ── Main page: user list ── */
export default function AdminUserBetsPage() {
  const navigate     = useNavigate();
  const [users,      setUsers]      = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setUsers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="admin-user-bets-page">
        <UserBetsEditor user={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="admin-user-bets-page">
      <div className="aub-header">
        <button className="aub-back-top" onClick={() => navigate('/admin')}>← חזור לאדמין</button>
        <h2>עריכת ניחושי משתמשים</h2>
      </div>

      <input
        className="aub-search"
        placeholder="חיפוש לפי שם..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="aub-loading">טוען משתמשים...</p>
      ) : (
        <div className="aub-user-list">
          {filtered.map((u) => (
            <div key={u._id} className="aub-user-row" onClick={() => setSelected(u)}>
              <span className="aub-uname">{u.username}</span>
              <span className="aub-pts">{u.points ?? 0} נק'</span>
              <span className="aub-arrow">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
