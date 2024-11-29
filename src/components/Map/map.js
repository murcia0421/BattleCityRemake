import React, { useEffect, useState } from 'react';
import baseImage from '../../assets/images/map/base.png';
import treeImage from '../../assets/images/map/trees.png';
import wallBrickImage from '../../assets/images/map/wall_brick.png';
import wallSteelImage from '../../assets/images/map/wall_steel.png';
import PlayerController from '../../Controller/PlayerController';
import './Map.css';
import mapData from './MapData';

const MAX_PLAYERS = 2;

// Posiciones iniciales fijas para cada jugador
const INITIAL_POSITIONS = {
  player1: { x: 1, y: 1},  // Jugador 1 en la parte inferior izquierda
  player2: { x: 2, y: 9 }   // Jugador 2 en la parte inferior derecha
};

const getTileImage = (tile) => {
  switch (tile) {
    case 1: return <img src={wallBrickImage} alt="Wall Brick" />;
    case 2: return <img src={wallSteelImage} alt="Wall Steel" />;
    case 3: return <img src={treeImage} alt="Tree" />;
    case 4: return <img src={baseImage} alt="Base" />;
    default: return null;
  }
};

const Map = () => {
  // Estado para determinar qué playerId usar para este cliente
  const [playerId, setPlayerId] = useState(() => {
    const storedId = sessionStorage.getItem('playerId');
    if (storedId) return storedId;
    return null;
  });

  useEffect(() => {
    if (!playerId) {
      // Si no hay playerId almacenado, asignar uno nuevo
      const newPlayerId = sessionStorage.getItem('playerId') || 
                         `player${Math.floor(Math.random() * MAX_PLAYERS) + 1}`;
      sessionStorage.setItem('playerId', newPlayerId);
      setPlayerId(newPlayerId);
    }
  }, []);

  return (
    <div className="Map">
      {/* Renderizar el mapa base */}
      {mapData.map((row, rowIndex) => (
        <div key={rowIndex} className="map-row">
          {row.map((tile, colIndex) => (
            <div key={colIndex} className="map-tile">
              {getTileImage(tile)}
            </div>
          ))}
        </div>
      ))}
      
      {/* Renderizar el PlayerController solo si tenemos un playerId */}
      {playerId && (
        <PlayerController
          playerId={playerId}
          initialPosition={INITIAL_POSITIONS[playerId]}
          mapData={mapData}
        />
      )}
    </div>
  );
};

export default Map;