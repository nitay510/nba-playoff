import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';      // hamburger icon
import RulesModal from './RulesModal';
import './Header.scss';

function Header() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [showRules, setShowRules] = useState(false);

  /* logout */
  const handleLogout = async () => {
    try {
      await fetch(
        'https://nba-playoff-eyd5.onrender.com/api/auth/logout',
        { method: 'POST', credentials: 'include' }
      );
    } catch (_) { /* ignore network errors */ }
    localStorage.removeItem('username');
    navigate('/');
  };

  /* mailto */
  const handleContact = () => {
    window.location.href =
      'mailto:nitay510@gmail.com?subject=FinalBet%20Support';
  };

  return (
    <div className="app-header">
      {/* menu icon – right side */}
      <FaBars
        className="menu-icon"
        onClick={() => setOpenMenu((prev) => !prev)}
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

      {/* logo – left side */}
      <img src="/logo1.png" alt="App Logo" className="header-logo" />

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default Header;
