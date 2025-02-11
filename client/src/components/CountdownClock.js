import React, { useState, useEffect } from 'react';
import './CountdownClock.scss';

function CountdownClock({ startDate }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = new Date(startDate) - now;
      if (diff <= 0) {
        setTimeLeft('00:00');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        );
      }
    };

    updateCountdown(); // initial call
    const timer = setInterval(updateCountdown, 30000); // update every 30 sec

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <span className="countdown-clock">
      {timeLeft}
    </span>
  );
}

export default CountdownClock;
