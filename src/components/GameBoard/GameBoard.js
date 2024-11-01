
import React, { useState, useEffect } from 'react';
import Map from '../Map/map';
import Bullet from '../Bullets/Bullet';
import usePlayerInput from '../../hooks/usePlayerInput';
import CollisionUtils from '../../utils/collisionUtils';
import mapData from '../Map/MapData';
import WebSocketClient from '../../websocket/WebSocketClient';
import PlayerController from '../../Controller/PlayerController';

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

