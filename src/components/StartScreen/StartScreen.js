import PropTypes from 'prop-types';
import React from 'react';
import image1 from '../../assets/image1.webp';
import image3 from '../../assets/image3.webp';
import image2 from '../../assets/image5.webp';
import './StartScreen.css';

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <div className="collage">
        <img src={image1} alt="Imagen 1" />
        <img src={image2} alt="Imagen 2" />
        <img src={image3} alt="Imagen 3" />
      </div>
      <div className="text-box">
        <h1>Bienvenido a Battle City</h1>
        <p>Haz clic en el botón para comenzar el juego</p>
        <button onClick={onStart}>Iniciar Juego</button>
      </div>
    </div>
  );
};

StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default StartScreen;
