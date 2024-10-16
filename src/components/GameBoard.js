import React, { useState, useEffect } from 'react';
import wallBrickImage from '../assets/images/map/wall_brick.png';
import wallSteelImage from '../assets/images/map/wall_stell.png';
import treeImage from '../assets/images/map/trees.png';
import baseImage from '../assets/images/map/base.png';
import playerImage from '../assets/images/tank.png';
import '../styles/GameBoard.css';
import PlayerController from './PlayerController';

// El mapa del juego representado en una matriz 2D
// 0 = vacío, 1 = muro de ladrillo, 2 = muro de acero, 3 = árboles, 4 = base
const mapData = [
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 2, 2, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 0, 2, 2, 1, 0, 2, 2, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 3, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 2, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 2, 2, 0, 2, 2, 2],
  [2, 0, 4, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2],
  [2, 0, 2, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 2, 2, 0, 2, 2, 2],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 2, 2, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 0, 2, 2, 1, 0, 2, 2, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 3, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 2, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 2, 2, 0, 2, 2, 2],
  [2, 0, 4, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2],
  [2, 0, 2, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 2, 2, 0, 2, 2, 2],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 2, 2, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1]
];


const getTileImage = (tile) => {
  switch (tile) {
    case 1:
      return wallBrickImage;
    case 2:
      return wallSteelImage;
    case 3:
      return treeImage;
    case 4:
      return baseImage;
    case 0:
    default:
      return null;
  }
};

const GameBoard = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 2, y: 2 });

  const handleKeyDown = (event) => {
    const { key } = event;
    let newPosition = { ...playerPosition };

    switch (key) {
      case 'w':
        newPosition.y = Math.max(0, playerPosition.y - 1);
        break;
      case 's':
        newPosition.y = Math.min(mapData.length - 1, playerPosition.y + 1);
        break;
      case 'a':
        newPosition.x = Math.max(0, playerPosition.x - 1);
        break;
      case 'd':
        newPosition.x = Math.min(mapData[0].length - 1, playerPosition.x + 1);
        break;
      default:
        return;
    }
    if (mapData[newPosition.y][newPosition.x] === 0) {
      setPlayerPosition(newPosition);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPosition]);
  useEffect(() => {
    console.log(`Posición del jugador: (${playerPosition.x}, ${playerPosition.y})`);
  }, [playerPosition]);

  return (
    <div className="game-board" style={{ position: 'relative' }}>
      {mapData.map((row, rowIndex) => (
        <div className="game-board__row" key={rowIndex}>
          {row.map((tile, colIndex) => {
            const tileImage = getTileImage(tile);
            return (
              <div className="game-board__tile" key={colIndex}>
                {tileImage && <img src={tileImage} alt="tile" />}
                {/* Renderizar el jugador en la posición actual */}
                {rowIndex === playerPosition.y && colIndex === playerPosition.x && (
                  <img src={playerImage} alt="player" className="player" />
                )}
              </div>
            );
          })}
        </div>
      ))}
      {/* Render PlayerController */}
      <PlayerController />
    </div>
  );
};

export default GameBoard;