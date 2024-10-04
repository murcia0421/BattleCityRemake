import React from 'react';
import '../styles/GameBoard.css'; 

import Tank from './Tank';     
import Bullet from './Bullet'; 

const GameBoard = () => {
  const playerPosition = { x: 100, y: 100 };
  const bulletPosition = { x: 150, y: 150 };

  return (
    <div className="GameBoard">
      {/* Renderizar tanques y balas */}
      <Tank position={playerPosition} />
      <Bullet position={bulletPosition} />
    </div>
  );
};

export default GameBoard;
