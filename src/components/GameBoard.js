import React from 'react';
import wallBrickImage from '../assets/images/map/wall_brick.png';
import wallSteelImage from '../assets/images/map/wall_stell.png';
import treeImage from '../assets/images/map/trees.png';
import baseImage from '../assets/images/map/base.png';  // Importa la imagen de la base
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
  return (
    <div className="game-board" style={{ position: 'relative' }}>
      {mapData.map((row, rowIndex) => (
        <div className="game-board__row" key={rowIndex}>
          {row.map((tile, colIndex) => {
            const tileImage = getTileImage(tile);
            return (
              <div className="game-board__tile" key={colIndex}>
                {tileImage && <img src={tileImage} alt="tile" />}
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
