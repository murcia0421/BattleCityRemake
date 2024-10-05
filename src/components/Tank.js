import React from 'react';
import tankImage from '../assets/images/tank.png';  
import '../styles/Tank.css';

const TILE_SIZE = 32; // Ajusta el tamaño según sea necesario

const Tank = ({ x, y, direction }) => {
  console.log('Posición del tanque:', x, y, 'Dirección:', direction);

  const style = {
    left: `${x * TILE_SIZE}px`,
    top: `${y * TILE_SIZE}px`,
    position: 'absolute'
  };

  return (
    <div className="tank" style={style}>
      <img src={tankImage} alt="Tank" />
    </div>
  );
};

export default Tank;
