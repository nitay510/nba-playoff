import React from 'react';
import './TeamLogo.scss';

/**
 * This function just does an exact string match:
 * "גולדן סטייט" => "/assets/logos/גולדן סטייט.png"
 */
function getLogoSrc(teamName) {
  // We assume the PNG is named exactly the same as teamName + ".png"
  // e.g. "גולדן סטייט" => "גולדן סטייט.png"
  return `/NbaTeamLogos/${teamName}.png`;
}

export default function TeamLogo({ teamName, className = '' }) {
  const src = getLogoSrc(teamName);

  return (
    <img
      src={src}
      alt={teamName}
      className={`team-logo ${className}`}
      onError={(e) => {
        // fallback if file not found
        e.currentTarget.src = '/assets/logos/default.png';
      }}
    />
  );
}
