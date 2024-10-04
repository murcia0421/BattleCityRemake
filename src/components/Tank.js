import React from 'react';
import playerTankImg from '../assets/images/tank.png'; 

const Tank = ({ position }) => {
  return (
    <img
      src={playerTankImg} 
      alt="Player Tank"
      className="tank"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        position: 'absolute',
        width: '40px',
        height: '40px',
      }}
    />
  );
};

export default Tank;