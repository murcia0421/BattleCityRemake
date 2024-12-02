import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import './Player.css';

import tankYellow from '../../assets/images/tank.png';
import tankBlue from '../../assets/images/tankblue.png';
import tankGreen from '../../assets/images/tankgreen.png';
import tankPurple from '../../assets/images/tankpurple.png';

const TILE_SIZE = 32;

const Player = ({ position, direction, tankColor }) => {
  const tankImages = useMemo(() => ({
    'Azul': tankBlue,
    'Verde': tankGreen,
    'Morado': tankPurple,
    'Amarillo': tankYellow,
  }), []);

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
  };

  return (
    <div className="player" style={playerStyle}>
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
};

export default React.memo(Player);
