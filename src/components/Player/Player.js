
import React from 'react';
import tankImage from '../../assets/images/tank.png';

const TILE_SIZE = 32; // Ajusta el tamaño si es necesario

const Player = ({ position, direction }) => {

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
/*
      const style = {
        left: `${position.x }px`,
        top: `${position.y }px`,
        position: 'absolute',
        transform: `rotate(${getRotation(direction)}deg)`, // Rotar la imagen según la dirección
      };
    
      return (
        <div className="player" style={style}>
          <img src={tankImage} alt="Tank" />
        </div>
      );
    };*/

    return (
        <div
            className="player"
            style={{
                //left: position.x * TILE_SIZE,
                //top: position.y * TILE_SIZE,
                left: `${position.x }px`,
                top: `${position.y }px`,
                position: 'absolute',
                transform: `rotate(${getRotation(direction)}deg)`,
            }}
        >
            <img src={tankImage} alt="Tank" style={{ width: TILE_SIZE, height: TILE_SIZE }} />
        </div>
    );
};

export default Player;
