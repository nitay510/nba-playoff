import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaClipboardList,
  FaRegComments,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import RulesModal from './RulesModal';
import ContactModal from './ContactModal';
import './Header.scss';

function Header() {
  const navigate = useNavigate();

  const [menuOpen,    setMenuOpen]   = useState(false);
  const [showRules,   setShowRules]  = useState(false);
  const [showContact, setShowContact] = useState(false);

  const username = localStorage.getItem('username') || 'שם משתמש';

  /* logout */
  const handleLogout = async () => {
    try {
      await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/auth/logout',
        { method: 'POST', credentials: 'include' }
      );
    } catch (_) {}
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <>
      {/* ---------- header bar (unchanged) ---------- */}
      <div className="app-header">
        <FaBars className="menu-icon" onClick={() => setMenuOpen(true)} />
        <img src="/logo1.png" alt="App Logo" className="header-logo" />
      </div>

      {/* ---------- slide‑in menu ---------- */}
      {menuOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
          <aside className="side-menu">
            {/* purple top */}
            <div className="menu-top">
              <FaUserCircle className="avatar" />
              <span className="user-name">{username}</span>
              <div className="top-sep" />
            </div>

            {/* items */}
            <button
              className="menu-item"
              onClick={() => {
                setShowRules(true);
                setMenuOpen(false);
              }}
            >
              <span>חוקי המשחק</span>
              <FaClipboardList />
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setShowContact(true);
                setMenuOpen(false);
              }}
            >
              <span>צור קשר</span>
              <FaRegComments />
            </button>

            <button className="menu-item" onClick={handleLogout}>
              <span>התנתק</span>
              {/* flip icon for RTL “exit” arrow */}
              <FaSignOutAlt style={{ transform: 'scaleX(-1)' }} />
            </button>
          </aside>
        </>
      )}

      {showRules   && <RulesModal   onClose={() => setShowRules(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  );
}

export default Header;
