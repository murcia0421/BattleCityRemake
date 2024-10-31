// Map.js
import './Map.css'; // Importar el CSS

import React, { useState } from 'react';
import mapData from './MapData'; // Importar los datos del mapa
import mapData2 from './MapData'; // Importar los datos del mapa
import wallBrickImage from '../../assets/images/map/wall_brick.png'; // Asegúrate de que la ruta sea correcta
import wallSteelImage from '../../assets/images/map/wall_steel.png'; // Asegúrate de que la ruta sea correcta
import treeImage from '../../assets/images/map/trees.png'; // Asegúrate de que la ruta sea correcta
import baseImage from '../../assets/images/map/base.png'; // Asegúrate de que la ruta sea correcta
import PlayerController from '../../Controller/PlayerController'; 
import Player from '../Player/Player';
import tankImage from '../../assets/images/tank.png';

const MAX_PLAYERS = 2;

const getTileImage = (tile) => {
  switch (tile) {
    case 1:
      return <img src={wallBrickImage} alt="Wall Brick" />;
    case 2:
      return <img src={wallSteelImage} alt="Wall Steel" />;
    case 3:
      return <img src={treeImage} alt="Tree" />;
    case 4:
      return <img src={baseImage} alt="Base" />;
    case 0:
    default:
      return null;
  }
};

const Map = () => {

  const [playersCreated, setPlayersCreated] = useState(1); // Lleva el conteo de los tanques creados

  return (
    <div className="Map">
      {/* Renderiza el mapa */}
      {mapData.map((row, rowIndex) => (
        <div key={rowIndex} className="map-row">
          {row.map((tile, colIndex) => (
            <div key={colIndex} className="map-tile">
              {/*getTileImage(tile)*/}
              {/*tile === 4 && playersCreated < MAX_PLAYERS ? (*/}
              {tile === 4  ? (
                // Renderiza el tanque si el tile es de tipo Base y el número de jugadores es menor que el máximo permitido
                  <>
                    {getTileImage(tile)}
                        {/*<PlayerController
                            playerId={`player${playersCreated }`}
                            initialPosition={{ x: colIndex, y: rowIndex }}
                            mapData={mapData2}
                        />*/}
                  </>
                    
                ) : (
                    // Renderiza solo la imagen del tile si no es de tipo Base o si ya se alcanzó el máximo de jugadores
                    getTileImage(tile)
                )}
            </div>
          ))}
        </div>
      ))}
      {/* Renderiza el controlador del jugador */}
      {<PlayerController
                            playerId={`player${playersCreated }`}
                            initialPosition={{ x: 2, y: 9 }}
                            mapData={mapData2}
                        />}
    </div>
  );
};
export default Map;
