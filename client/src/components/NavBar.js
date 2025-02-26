import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaListUl, FaTh } from 'react-icons/fa'; // Adjusted icon for leagues
import './NavBar.scss';

function NavBar() {
  return (
    <nav className="bottom-nav">
      <ul className="nav-list">
      <li>
          <NavLink to="/leagues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <FaTh className="nav-icon" />
              {window.location.pathname === "/leagues" && <span>ליגות</span>}
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-bets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <FaListUl className="nav-icon" />
              {window.location.pathname === "/my-bets" && <span>הימורים שלי</span>}
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <FaHome className="nav-icon" />
              {window.location.pathname === "/home" && <span>בית</span>}
            </div>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
