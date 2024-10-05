import React from 'react';
import tankImage from '../assets/images/tank.png';  // Asegúrate de tener la ruta correcta de la imagen del tanque
import '../styles/Tank.css';

const Tank = ({ x, y }) => {
  return (
    <div
      className="tank"
      style={{
        position: 'absolute',
        left: `${x * 32}px`,  // Ajusta el tamaño del bloque según el tamaño del tablero (32px o el que sea)
        top: `${y * 32}px`,
      }}
    >
      <img src={tankImage} alt="Tank" />
    </div>
  );
};

export default Tank;
