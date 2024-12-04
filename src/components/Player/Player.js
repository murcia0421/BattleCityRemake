import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import './Player.css';

import tankYellow from '../../assets/images/tank.png';
import tankBlue from '../../assets/images/tankblue.png';
import tankGreen from '../../assets/images/tankgreen.png';
import tankPurple from '../../assets/images/tankpurple.png';

const TILE_SIZE = 32;

const Player = ({ position, direction, tankColor, lives, isAlive }) => {
  const tankImages = useMemo(() => ({
    'Azul': tankBlue,
    'Verde': tankGreen,
    'Morado': tankPurple,
    'Amarillo': tankYellow,
  }), []);

  // Generar array de corazones basado en vidas
  //Si esto funciona  va a quedar muy cute
  const heartsDisplay = useMemo(() => 
    Array(lives).fill('❤️')
  , [lives]);

  // Si el jugador no está vivo, no renderizar nada
  //estoy muy seguro que esto va a explotar
  if (!isAlive) return null;

  const currentTankImage = tankImages[tankColor] || tankImages['Amarillo'];

  const directionToRotation = {
    up: 180,
    right: 270,
    down: 0,
    left: 90,
  };
  
  const getRotation = (dir) => directionToRotation[dir] || 0;

  const playerStyle = {
    left: `${position.x * TILE_SIZE}px`,
    top: `${position.y * TILE_SIZE}px`,
    position: 'absolute',
    transform: `rotate(${getRotation(direction)}deg)`,
    opacity: lives < 3 ? 0.8 : 1, // Reducir opacidad cuando está dañado
  };

  return (
    <div className={`player ${lives < 3 ? 'damaged' : ''}`} style={playerStyle}>
      {/* Indicador de vidas sobre el tanque */}
      <div className="lives-indicator">
        {heartsDisplay}
      </div>
      
      <img 
        src={currentTankImage} 
        alt={`Tank ${tankColor}`} 
        className="tank-image" 
      />
    </div>
  );
};

Player.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  direction: PropTypes.oneOf(['up', 'right', 'down', 'left']).isRequired, 
  tankColor: PropTypes.oneOf(['Azul', 'Verde', 'Morado', 'Amarillo']).isRequired,
  // Nuevos PropTypes
  //eliminar si explota
  lives: PropTypes.number.isRequired,
  isAlive: PropTypes.bool.isRequired,
};

// Valores por defecto para las nuevas props
//Igual esto 
Player.defaultProps = {
  lives: 3,
  isAlive: true
};

export default React.memo(Player);