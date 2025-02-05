import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaListUl, FaUsers } from 'react-icons/fa'; 
import './NavBar.scss';

function NavBar() {
  return (
    <nav className="bottom-nav">
      <ul className="nav-list">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaHome className="nav-icon" />
            <span>בית</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/my-bets"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaListUl className="nav-icon" />
            <span>הימורים שלי</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/leagues"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaUsers className="nav-icon" />
            <span>ליגות</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
