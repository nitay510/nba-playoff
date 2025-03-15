import React, { useState } from 'react';
import './Header.scss';
import RulesModal from './RulesModal'; 

function Header() {
  const [showRules, setShowRules] = useState(false);

  const handleOpenRules = () => {
    setShowRules(true);
  };

  const handleCloseRules = () => {
    setShowRules(false);
  };

  return (
    <div className="app-header">
      {/* אייקון סימן שאלה (למעשה, תמונה) מימין */}
      <img
        src="/Question.png"
        alt="שאלות"
        className="header-question"
        onClick={handleOpenRules}
      />

      {/* לוגו משמאל */}
      <img
        src="/logo1.png"
        alt="App Logo"
        className="header-logo"
      />

      {/* אם המשתמש לחץ => מציגים את RulesModal */}
      {showRules && (
        <RulesModal onClose={handleCloseRules} />
      )}
    </div>
  );
}

export default Header;
