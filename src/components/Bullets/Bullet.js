// src/components/Bullet.js
import React from 'react';
import bulletImage from '../../assets/images/bullet.png'; // Asegúrate de tener la imagen de la bala
import './Bullet.css';

const TILE_SIZE = 32; // Ajusta el tamaño según sea necesario

const Bullet = ({ x, y, direction }) => {
  const getRotation = (direction) => {
    switch (direction) {
      case 'up':
        return 180;
      case 'right':
        return 270;
      case 'down':
        return 0;
      case 'left':
        return 90;
      default:
        return 0;
    }
  };

  const style = {
    left: `${x * TILE_SIZE}px`,
    top: `${y * TILE_SIZE}px`,
    position: 'absolute',
    transform: `rotate(${getRotation(direction)}deg)`,
  };

  return (
    <div className="bullet" style={style}>
      <img src={bulletImage} alt="Bullet" />
    </div>
  );
};

export default Bullet;
