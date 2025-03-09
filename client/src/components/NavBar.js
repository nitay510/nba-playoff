import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { FaTrophy } from 'react-icons/fa6';
import { TbHistory } from 'react-icons/tb';
import './NavBar.scss';

function NavBar() {
  return (
    <nav className="bottom-nav">
      <ul className="nav-list">
        <li>
          <NavLink to="/leagues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <FaTrophy className="nav-icon" />
              <span className="nav-text">ליגות</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-bets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <TbHistory className="nav-icon" />
              <span className="nav-text">הימורים שלי</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <FaHome className="nav-icon" />
              <span className="nav-text">בית</span>
            </div>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
