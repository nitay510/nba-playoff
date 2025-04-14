import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import RulesModal from './RulesModal';
import ContactModal from './ContactModal';        // ← NEW
import './Header.scss';

function Header2() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showContact, setShowContact] = useState(false);   // ← NEW

  /* logout helper (unchanged) */
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
      <div className="app-header">
        <FaBars
          className="menu-icon"
          onClick={() => setOpenMenu((p) => !p)}
        />

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
            <li
              onClick={() => {
                setShowContact(true);          // ← open contact modal
                setOpenMenu(false);
              }}
            >
              צור קשר
            </li>
          </ul>
        )}

        <img src="/logo2.png" alt="App Logo" className="header-logo" />
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}  {/* NEW */}
    </>
  );
}

export default Header2;
