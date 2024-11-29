
import React, { useState } from 'react';
import CollisionUtils from '../../utils/collisionUtils';
import Bullet from '../Bullets/Bullet';
import Map from '../Map/map';
import mapData from '../Map/MapData';

const GameBoard = ({ tankColor }) => {
  const [players, setPlayers] = useState([]); // Lista de todos los jugadores en el juego
  const [bullets, setBullets] = useState([]); // Lista de todas las balas activas
  const collisionUtils = new CollisionUtils(mapData);

  return (
    <div className="game-board">
      <Map /> {/* Pasamos la lista de jugadores al componente Map */}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} {...bullet} />
      ))}
    </div>
  );
};

export default GameBoard;

