import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { BsClipboard2 } from 'react-icons/bs';
import { MdOutlineContactSupport } from 'react-icons/md';
import { RxExit } from 'react-icons/rx';
import './Header.scss';

function Header2() {
  const navigate = useNavigate();

  const [menuOpen,    setMenuOpen]   = useState(false);

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
      {/* top bar (unchanged) */}
      <div className="app-header">
        <FaBars className="menu-icon" onClick={() => setMenuOpen(true)} />
        <img src="/logo1.png" alt="App Logo" className="header-logo" />
      </div>

      {/* slide‑in menu */}
      {menuOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
          <aside className="side-menu">
            {/* purple header */}
            <div className="menu-top">
              <FaUserCircle className="avatar" />
              <span className="user-name">{username}</span>
            </div>

            {/* items – icon first, then text */}
            <button
  className="menu-item"
  onClick={() => {
    navigate('/rules');
    setMenuOpen(false);
  }}
>
  <BsClipboard2 />
  <span>חוקי המשחק</span>
</button>



            <button className="menu-item" onClick={handleLogout}>
              {/* flip for RTL exit arrow */}
              <RxExit style={{ transform: 'scaleX(-1)' }} />
              <span>התנתק</span>
            </button>
          </aside>
        </>
      )}

      {showRules   && <RulesModal   onClose={() => setShowRules(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  );
}

export default Header2;
