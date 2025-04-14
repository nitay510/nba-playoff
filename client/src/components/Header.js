import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';   //  ← FA icon via react‑icons
import RulesModal from './RulesModal';
import './Header.scss';

function Header() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [showRules, setShowRules] = useState(false);

  /* ───────── helpers ───────── */
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

  const handleContact = () => {
    window.location.href =
      'mailto:nitay510@gmail.com?subject=FinalBet%20Support';
  };

  /* ───────── render ───────── */
  return (
    <div className="app-header">
      {/* hamburger icon (right) */}
      <FaBars
        className="menu-icon"
        onClick={() => setOpenMenu((p) => !p)}
      />

      {/* dropdown */}
      {openMenu && (
        <ul
          className="header-dropdown"
          onMouseLeave={() => setOpenMenu(false)}
        >
          <li onClick={handleLogout}>התנתקות</li>
          <li
            onClick={() => {
              setShowRules(true);
              setOpenMenu(false);
            }}
          >
            חוקי המשחק
          </li>
          <li onClick={handleContact}>צור קשר</li>
        </ul>
      )}

      {/* logo (left) */}
      <img src="/logo1.png" alt="App Logo" className="header-logo" />

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default Header;
