import React from 'react';
import '../styles/StartScreen.css';

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>Bienvenido a Battle City</h1>
      <p>Haz clic en el botón para comenzar el juego</p>
      <button onClick={onStart}>Iniciar Juego</button>
    </div>
  );
};

export default StartScreen;
