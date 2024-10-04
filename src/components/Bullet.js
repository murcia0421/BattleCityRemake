import React from 'react';
import bulletImage from '../assets/images/bullet.png';

const Bullet = ({ position }) => {
  return (
    <img
      src={bulletImage} 
      alt="Bullet"
      className="bullet"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        position: 'absolute',
        width: '10px',
        height: '10px',
      }}
    />
  );
};

export default Bullet;
