import React, { useEffect, useState } from 'react';
import CollisionUtils from '../../utils/collisionUtils';
import Bullet from '../Bullets/Bullet';
import Map from '../Map/map';
import mapData from '../Map/MapData';

const GameBoard = ({ tankColor, playersData }) => {
  const [players, setPlayers] = useState(playersData || []); // Inicializar con los jugadores de la sala
  const [bullets, setBullets] = useState([]); 
  const collisionUtils = new CollisionUtils(mapData);

  useEffect(() => {
    // Actualizar jugadores cuando cambian en las props
    if (playersData) {
      setPlayers(playersData);
      console.log('Jugadores inicializados:', playersData);
    }
  }, [playersData]);

  return (
    <div className="game-board">
      <Map 
        players={players}
        tankColor={tankColor}
        mapData={mapData}
      />
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} {...bullet} />
      ))}
    </div>
  );
};

export default GameBoard;