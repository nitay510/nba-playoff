import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePopup.scss';

export default function WelcomePopup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  /* slides */
  const slides = [
    {
      title: 'ברוכים הבאים',
      text : 'אתגר ניחושי הפלייאוף החדש של ישראל!\nבחרו מנצחת, צברו נקודות והתחרו מול החברים.',
      image: '/onboarding/Frame.png',
    },
    {
      title: 'מנחשים את התוצאות',
      text : 'מי תנצח? בכמה משחקים? וניחושי בונוס',
      image: '/onboarding/Frame1.png',
    },
    {
      title: 'צוברים נקודות',
      text : 'צוברים ומשווים מול החברים בליגה.',
      image: '/onboarding/Frame2.png',
    },
    {
      title: 'יוצרים או מצטרפים',
      text : 'יוצרים ליגה חדשה או מצטרפים לליגה קיימת',
      image: '/onboarding/Frame3.png',
    },
  ];

  const { title, text, image } = slides[step];
  const isLast = step === slides.length - 1;

  const finish = () => {
    localStorage.setItem('tutorialSeen', 'true');
    navigate('/');
  };

  return (
    <div className="tutorial-page">
      <img src="/logo1.png" alt="logo" className="page-logo" />

      <div className="tutorial-content">
        <h2>{title}</h2>
        <p className="tutorial-text">{text}</p>

        {image && (
          <div className="tutorial-image">
            <img src={image} alt="tutorial step" />
          </div>
        )}

        <div className="button-row">
          <button
            className="next-btn"
            onClick={() => (isLast ? finish() : setStep(step + 1))}
          >
            {isLast ? 'להרשמה' : 'המשך'}
          </button>

          {!isLast && (
            <button className="skip-btn" onClick={finish}>
              דלג
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
