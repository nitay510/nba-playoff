import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
const addFonts = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      @font-face {
        font-family: 'Almoni Neue';
        src: url('/fonts/almoni-neue-regular-aaa.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
  
      @font-face {
        font-family: 'Almoni Neue';
        src: url('/fonts/almoni-neue-medium-aaa.otf') format('opentype');
        font-weight: 500;
        font-style: normal;
      }
  
      @font-face {
        font-family: 'Almoni Neue';
        src: url('/fonts/almoni-neue-bold-aaa.otf') format('opentype');
        font-weight: bold;
        font-style: normal;
      }
  
      @font-face {
        font-family: 'Almoni Neue';
        src: url('/fonts/almoni-neue-black-aaa.otf') format('opentype');
        font-weight: 900;
        font-style: normal;
      }
  
      @font-face {
        font-family: 'Almoni Neue';
        src: url('/fonts/almoni-neue-light-aaa.otf') format('opentype');
        font-weight: 300;
        font-style: normal;
      }
  
      @font-face {
        font-family: 'Almoni Neue';
        src: url('/fonts/almoni-neue-demibold-aaa.otf') format('opentype');
        font-weight: 600;
        font-style: normal;
      }
      
      body {
        font-family: 'Almoni Neue', sans-serif;
      }
    `;
    document.head.appendChild(style);
  };
  
  // Call the function when the app loads
  addFonts();
  