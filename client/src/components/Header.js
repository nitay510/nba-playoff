import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.scss'; // optional separate SCSS if you want

function Header() {
  const navigate = useNavigate();

  return (
    <div className="app-header">
              {/* Right side: question mark icon => navigate('/rules') */}
      <img
      src='/Question.png'
        className="header-question"
        onClick={() => navigate('/rules')}
      />
     
      {/* Left side: the logo from public folder */}
      <img
        src="/logo1.png"
        alt="App Logo"
        className="header-logo"
      />

    </div>
  );
}

export default Header;
