
import React from 'react';
import tankImage from '../../assets/images/tank.png';
import './Player.css';

const TILE_SIZE = 32; // Ajusta el tamaño si es necesario

const Player = ({ position, direction }) => {

  //console.warn('position',position);
  //console.warn('direction',direction);

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
      
    return (
        <div
            className="player"
            style={{
                //left: position.x * TILE_SIZE,
                //top: position.y * TILE_SIZE,
                left: `${ position.x * TILE_SIZE}px`,
                top: `${ position.y * TILE_SIZE}px`,
                position: 'absolute',
                transform: `rotate(${getRotation(direction)}deg)`,
            }}
        >
          <img src={tankImage} alt="Tank" style={{ width: '100%', height: '100%' }} />
        </div>
    );
    
};

export default Player;
