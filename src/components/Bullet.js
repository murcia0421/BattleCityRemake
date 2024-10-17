import React from 'react';
import bulletImage from '../assets/images/bullet.png';

const Bullet = ({ x, y, direction }) => {
  const styles = {
      position: 'absolute',
      left: `${x * 32}px`, // Ajustar según el tamaño de las celdas en el tablero
      top: `${y * 32}px`,
      width: '16px',
      height: '16px',
      transform: `rotate(${getRotation(direction)}deg)`,
  };

  function getRotation(direction) {
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
  }

  return <img src={bulletImage} alt="bullet" style={styles} />;
};

export default Bullet;

/*
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
*/
