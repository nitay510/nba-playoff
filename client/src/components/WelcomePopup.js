import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePopup.scss';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0); // which slide (0..2..)
  const navigate = useNavigate();

  // Slides array:
  const slides = [
    {
      // first slide has no image
      title: 'ברוכים הבאים',
      text: 'אתגר ניחושי הפלייאוף החדש של ישראל!\nבחרו מנצחת, צברו נקודות והתחרו מול החברים.',
      image: '/onboarding/Frame.png',
    },
    {
      title: 'מנחשים את התוצאות',
      text: 'מי תנצח? בכמה משחקים? וניחושי בונוס',
      image: '/onboarding/Frame1.png',
    },
    {
      title: 'צוברים נקודות',
      text: 'צוברים ומשווים מול החברים בליגה.',
      image: '/onboarding/Frame2.png',
    },
    {
      title: 'יוצרים או מצטרפים',
      text: 'יוצרים ליגה חדשה או מצטרפים לליגה קיימת',
      image: '/onboarding/Frame3.png',
    },
  ];

  // Show only if tutorialSeen not set
  useEffect(() => {
    if (!localStorage.getItem('tutorialSeen')) {
      setShow(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem('tutorialSeen', 'true');
    setShow(false);
  };

  if (!show) return null; // skip entirely if not showing

  const { title, text, image } = slides[step];
  const isLast = step === slides.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setStep(step + 1);
    } else {
      // final step => close & go register
      close();
      navigate('/register');
    }
  };

  return (
    <div className="tutorial-overlay" >
      <div className="tutorial-box" onClick={(e) => e.stopPropagation()}>
      <img src="/logo1.png" alt="App Logo" className="header-logo" />
        <h2>{title}</h2>
        <p className='text1'>{text}</p>

        <div className="tutorial-image">
          {/* only render <img> if we have an image path */}
          {image && <img src={image} alt="tutorial step" />}
        </div>
        <div className="button-row">
        <button className="next-btn" onClick={handleNext}>
          {isLast ? 'אני רוצה להתחיל!' : 'המשך'}
        </button>
        {!isLast && (
            <button className="skip-btn" onClick={close}>
              דלג
            </button>
          )}
      </div>
      </div>
    </div>
  );
}
