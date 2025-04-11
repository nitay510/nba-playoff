import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePopup.scss';

export default function WelcomePopup() {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0); // which slide (0..2)
    const navigate = useNavigate();
  
    // We define 3 slides:
    const slides = [
      {
        title: 'מהמרים על סדרות',
        text: 'בחרו מנצחת בכל סדרה, הוסיפו הימורים נוספים וצברו נקודות.',
        image: '/onboarding/screenshot1.jpg'
      },
      {
        title: 'בודקים תוצאות',
        text: 'לאחר כל משחק או סיום סדרה, בדקו כמה נקודות הרווחתם!',
        image: '/onboarding/screenshot2.jpg'
      },
      {
        title: 'מתחרים בחברים',
        text: 'הצטרפו לליגות פרטיות, השוו ניקוד ושברו שוויונות.',
        image: '/onboarding/screenshot3.jpg'
      }
    ];
  
    // Show this tutorial only once
    useEffect(() => {
      if (!localStorage.getItem('tutorialSeen')) {
        setShow(true);
      }
    }, []);
  
    // The user can close (×) at any time
    const close = () => {
      localStorage.setItem('tutorialSeen', 'true');
      setShow(false);
    };
  
    if (!show) return null; // if we shouldn't show, do nothing
  
    // Which slide are we on?
    const { title, text, image } = slides[step];
    const isLastSlide = step === slides.length - 1;
  
    const handleNext = () => {
      if (!isLastSlide) {
        setStep(step + 1);
      } else {
        // final step => go register
        close();
        navigate('/register');
      }
    };
  
    return (
      <div className="tutorial-overlay" onClick={close}>
        <div className="tutorial-box" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={close}>×</button>
  
          <h2>{title}</h2>
          <p>{text}</p>
  
          <div className="tutorial-image">
            <img src={image} alt="tutorial step" />
          </div>
  
          <button className="next-btn" onClick={handleNext}>
            {isLastSlide ? 'להרשמה' : 'הבא'}
          </button>
        </div>
      </div>
    );
  }
