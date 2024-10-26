
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
/*
  useEffect(() => {
    console.log('GameBoard mounted'); // Verifica que el componente se está montando

    const handlePlayerMoved = (data) => {
      // Actualizar posición de los jugadores
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === data.playerId
            ? { ...player, position: data.position, direction: data.direction }
            : player
        )
      );
    };

    const handleBulletFired = (bullet) => {
      setBullets((prevBullets) => [...prevBullets, bullet]);
    };

    // Suscribirse a los eventos de WebSocket
    WebSocketClient.on('playerMoved', handlePlayerMoved);
    WebSocketClient.on('bulletFired', handleBulletFired);

    // Limpiar el efecto
    return () => {
      WebSocketClient.off('playerMoved', handlePlayerMoved);
      WebSocketClient.off('bulletFired', handleBulletFired);
    };
  }, []);

  const handlePlayerAction = (action) => {
    console.log('handlePlayerAction called with action:', action); // Verifica que la función se está llamando

    switch (action.type) {
      case 'MOVE':
        movePlayer(action);
        break;
      case 'SHOOT':
        shootBullet(action);
        break;
      default:
        break;
    }
  };

  const movePlayer = (action) => {
    const updatedPlayers = players.map((player) => {
      if (player.id === action.playerId) {
        const newPosition = calculateNewPosition(player.position, action.direction);

        if (!collisionUtils.checkCollision(newPosition)) {
          const updatedPlayer = { ...player, position: newPosition, direction: action.direction };
          WebSocketClient.sendAction({ type: 'playerMoved', playerId: player.id, position: newPosition, direction: action.direction });
          return updatedPlayer;
        }
      }
      return player;
    });
    setPlayers(updatedPlayers);
  };

  const shootBullet = (action) => {
    const player = players.find((p) => p.id === action.playerId);
    if (player) {
      const newBullet = {
        id: Date.now(),
        position: { ...player.position },
        direction: player.direction,
      };
      setBullets((prevBullets) => [...prevBullets, newBullet]);
      WebSocketClient.sendAction({ type: 'bulletFired', bullet: newBullet });
    }
  };

  const calculateNewPosition = (currentPosition, direction) => {
    let newPosition = { ...currentPosition };
    switch (direction) {
      case 'up':
        newPosition.y -= 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      default:
        break;
    }
    return newPosition;
  };

  usePlayerInput(handlePlayerAction);
  */
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

