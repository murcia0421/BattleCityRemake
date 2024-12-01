import React from 'react';
import './Player.css';

// Importa todas las imágenes de los tanques
import tankYellow from '../../assets/images/tank.png';
import tankBlue from '../../assets/images/tankblue.png';
import tankGreen from '../../assets/images/tankgreen.png';
import tankPurple from '../../assets/images/tankpurple.png';

const TILE_SIZE = 32;

const Player = ({ position, direction, tankColor }) => {
  // Mapeo de colores con sus imágenes correspondientes
  const tankImages = {
    'Azul': tankBlue,
    'Verde': tankGreen,
    'Morado': tankPurple,
    'Amarillo': tankYellow,
  };

  // Selección de la imagen según el color
  const currentTankImage = tankImages[tankColor] || tankImages['Amarillo'];

  const getRotation = (direction) => {
    switch (direction) {
      case 'up': return 180;
      case 'right': return 270;
      case 'down': return 0;
      case 'left': return 90;
      default: return 0;
    }
  };

  return (
    <div
      className="player"
      style={{
        left: `${position.x * TILE_SIZE}px`,
        top: `${position.y * TILE_SIZE}px`,
        position: 'absolute',
        transform: `rotate(${getRotation(direction)}deg)`,
      }}
    >
      <img 
        src={currentTankImage} 
        alt={`Tank ${tankColor}`} 
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  );
};

export default Player;
