import './Map.css';
import React from 'react';
import wallBrickImage from '../../assets/images/map/wall_brick.png';
import wallSteelImage from '../../assets/images/map/wall_steel.png';
import treeImage from '../../assets/images/map/trees.png';
import baseImage from '../../assets/images/map/base.png';
import PlayerController from '../../Controller/PlayerController';

const getTileImage = (tile) => {
  switch (tile) {
    case 1: return <img src={wallBrickImage} alt="Wall Brick" />;
    case 2: return <img src={wallSteelImage} alt="Wall Steel" />;
    case 3: return <img src={treeImage} alt="Tree" />;
    case 4: return <img src={baseImage} alt="Base" />;
    default: return null;
  }
};

const Map = ({ players, tankColor, mapData }) => {
  // Ya no necesitamos manejar el playerId aquí porque viene de la sala de espera
  console.log('Jugadores recibidos en Map:', players);

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
      
      {/* Renderizar un PlayerController por cada jugador */}
      {players?.map((player) => (
        <PlayerController
          key={player.id}
          playerId={player.id}
          playerName={player.name}
          initialPosition={player.position}
          tankColor={tankColor}
          mapData={mapData}
          allPlayers={players}
        />
      ))}
    </div>
  );
};

export default Map;