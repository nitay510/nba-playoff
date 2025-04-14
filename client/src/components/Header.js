// client/src/components/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RulesModal from './RulesModal';
import './Header.scss';

function Header() {
  const navigate = useNavigate();

  /* state */
  const [showRules, setShowRules] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  /* helpers */
  const handleLogout = async () => {
    try {
      await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/auth/logout',
        { method: 'POST', credentials: 'include' }
      );
    } catch (_) {/* ignore network errors */}
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleContact = () => {
    window.location.href =
      'mailto:nitay510@gmail.com?subject=FinalBet%20Support';
  };

  return (
    <div className="app-header">
      {/* menu / hamburger icon (right side) */}
      <img
        src="/menu.svg"            /* place a small hamburger icon in /public */
        alt="תפריט"
        className="menu-icon"
        onClick={() => setOpenMenu((p) => !p)}
      />

      {/* drop‑down list */}
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

      {/* rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default Header;
