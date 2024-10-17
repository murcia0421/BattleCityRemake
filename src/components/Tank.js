import React from 'react';
import tankImage from '../assets/images/tank.png';  
import '../styles/Tank.css';

const TILE_SIZE = 32; // Ajusta el tamaño según sea necesario

const Tank = ({ x, y, direction }) => {
  console.log('Posición del tanque:', x, y, 'Dirección:', direction);

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
    transform: `rotate(${getRotation(direction)}deg)`, // Rotar la imagen según la dirección
  };

  return (
    <div className="tank" style={style}>
      <img src={tankImage} alt="Tank" />
    </div>
  );
};

export default Tank;
