import PropTypes from 'prop-types';
import React from 'react';
import bulletImage from '../../assets/images/bullet.png';

const TILE_SIZE = 32; 

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

// PropTypes validation for the props
Bullet.propTypes = {
  x: PropTypes.number.isRequired, // x should be a number
  y: PropTypes.number.isRequired, // y should be a number
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']).isRequired, // direction should be one of these four strings
};

export default Bullet;
