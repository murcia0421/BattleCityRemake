import { Client } from '@stomp/stompjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Player from '../components/Player/Player';
import usePlayerInput from '../hooks/usePlayerInput';
import CollisionUtils from '../utils/collisionUtils';
import BulletController from './BulletController';
import GameOverModal from '../components/Winner/GameOverModal';

const MOVEMENT_SPEED = 0.1;

function PlayerController({ playerId, playerName, initialPosition, mapData, tankColor, roomId, onRestart }) {
   const [gameState, setGameState] = useState({
       players: {
           [playerId]: { 
               id: playerId, 
               name: playerName, 
               position: initialPosition, 
               direction: 'down', 
               tankColor: tankColor,
               lives: 3,
               isAlive: true 
           }
       },
   });
   const [stompClient, setStompClient] = useState(null);
   const [isConnected, setIsConnected] = useState(false);
   const collisionUtils = new CollisionUtils(mapData);
   const bulletControllerRef = useRef(null);
   const [showGameOver, setShowGameOver] = useState(false);
   const [winner, setWinner] = useState(null);


   const handleGameUpdate = useCallback((message) => {
    if (!message?.body) return;

    try {
        const update = JSON.parse(message.body);

        switch (update.type) {
            case 'PLAYER_MOVE':
                if (update.playerId !== playerId) {
                    setGameState(prev => ({
                        ...prev,
                        players: {
                            ...prev.players,
                            [update.playerId]: {
                                id: update.playerId,
                                position: update.position,
                                direction: update.direction,
                                tankColor: update.tankColor,
                                lives: update.lives,
                                isAlive: update.isAlive,
                                name: update.name
                            }
                        }
                    }));
                }
                break;

            case 'PLAYER_JOIN':
                setGameState(prev => ({
                    ...prev,
                    players: {
                        ...prev.players,
                        [update.player.id]: {
                            id: update.player.id,
                            name: update.player.name,
                            position: update.player.position,
                            direction: update.player.direction,
                            tankColor: update.player.tankColor,
                            lives: update.player.lives || 3,
                            isAlive: update.player.isAlive !== undefined ? update.player.isAlive : true
                        }
                    }
                }));
                break;

            case 'PLAYER_HIT':
                setGameState(prev => ({
                    ...prev,
                    players: {
                        ...prev.players,
                        [update.playerId]: {
                            ...prev.players[update.playerId],
                            lives: update.lives
                        }
                    }
                }));
                break;

            case 'PLAYER_ELIMINATED':
                setGameState(prev => ({
                    ...prev,
                    players: {
                        ...prev.players,
                        [update.playerId]: {
                            ...prev.players[update.playerId],
                            lives: 0,
                            isAlive: false
                        }
                    }
                }));
                break;

                case 'GAME_OVER':
                    setWinner(update.nameWinner);
                    setShowGameOver(true);
                    break;

            default:
                console.warn('Mensaje desconocido:', update.type);

        }
    } catch (error) {
        console.error('Error procesando mensaje:', error);
    }
}, [playerId]);

const handleRestart = () => {
    if (stompClient?.connected) {
        stompClient.unsubscribe(`/topic/room/${roomId}/game-updates`);
        
        // Sacar a patadas a todos de las salas 
        stompClient.publish({
            destination: `/app/room/${roomId}/leave-allplayers`,
            body: JSON.stringify({
                roomId: roomId
            })
        });
    }
    
    // Volver a la pantalla de inicio
    onRestart(); 
};

   useEffect(() => {
       const socket = new SockJS('http://localhost:8080/ws');
       const client = new Client({
           webSocketFactory: () => socket,
           reconnectDelay: 5000,
           debug: str => console.log('STOMP Debug:', str),
       });

       client.onConnect = () => {
           console.log('Conectado al servidor');
           setIsConnected(true);
           setStompClient(client);

           client.subscribe(`/topic/room/${roomId}/game-updates`, handleGameUpdate);

           client.publish({
               destination: `/app/room/${roomId}/game-join`,
               body: JSON.stringify({
                   type: 'PLAYER_JOIN',
                   player: { 
                       id: playerId, 
                       name: playerName, 
                       position: initialPosition, 
                       direction: 'down',
                       tankColor: tankColor,
                       lives: 3,
                       isAlive: true
                   }
               })
           });
       };

       client.onDisconnect = () => {
           console.log('Desconectado del servidor');
           setIsConnected(false);
       };

       client.onStompError = (error) => console.error('Error STOMP:', error);

       client.activate();

       return () => {
           if (client.connected) client.deactivate();
       };
   }, [playerId, playerName, initialPosition, tankColor, handleGameUpdate]);

   const movePlayer = useCallback((direction) => {
       if (!stompClient?.connected || !isConnected) return;

       const currentPlayer = gameState.players[playerId];
       if (!currentPlayer?.isAlive) return;

       let newX = currentPlayer.position.x;
       let newY = currentPlayer.position.y;

       switch (direction) {
           case 'up': newY -= MOVEMENT_SPEED; break;
           case 'down': newY += MOVEMENT_SPEED; break;
           case 'left': newX -= MOVEMENT_SPEED; break;
           case 'right': newX += MOVEMENT_SPEED; break;
       }

       const newPosition = { x: newX, y: newY };
       const corners = [
           { x: Math.floor(newPosition.x), y: Math.floor(newPosition.y) },
           { x: Math.floor(newPosition.x + 0.8), y: Math.floor(newPosition.y) },
           { x: Math.floor(newPosition.x), y: Math.floor(newPosition.y + 0.8) },
           { x: Math.floor(newPosition.x + 0.8), y: Math.floor(newPosition.y + 0.8) }
       ];

       const hasCollision = corners.some(corner => 
           corner.x < 0 || corner.x >= mapData[0].length || 
           corner.y < 0 || corner.y >= mapData.length || 
           collisionUtils.checkCollision(corner)
       );

       if (!hasCollision) {
           setGameState(prev => ({
               ...prev,
               players: {
                   ...prev.players,
                   [playerId]: {
                       ...currentPlayer,
                       position: newPosition,
                       direction
                   }
               }
           }));

           stompClient.publish({
               destination: `/app/room/${roomId}/game-move`,
               body: JSON.stringify({
                   type: 'PLAYER_MOVE',
                   playerId,
                   position: newPosition,
                   direction,
                   tankColor: currentPlayer.tankColor,
                   lives: currentPlayer.lives,
                   isAlive: currentPlayer.isAlive,
                   name: currentPlayer.name
               })
           });
       } else {
           setGameState(prev => ({
               ...prev,
               players: {
                   ...prev.players,
                   [playerId]: {
                       ...currentPlayer,
                       direction
                   }
               }
           }));
       }
   }, [playerId, stompClient, isConnected, gameState.players, collisionUtils, mapData]);

   usePlayerInput(action => {
       switch (action.type) {
           case 'MOVE':
               movePlayer(action.direction);
               break;
           case 'SHOOT':
               bulletControllerRef.current?.shoot();
               break;
       }
   });

   return (
    <div className="game-container">
        {Object.values(gameState.players).map(player => (
            <React.Fragment key={player.id}>
                <Player 
                    {...player} 
                    isCurrentPlayer={player.id === playerId} 
                    tankColor={player.tankColor}
                    lives={player.lives}
                    isAlive={player.isAlive}
                />
                {player.isAlive && (
                    <BulletController
                        ref={bulletControllerRef}
                        playerId={player.id}
                        stompClient={stompClient}
                        playerPosition={player.position}
                        playerDirection={player.direction}
                        isCurrentPlayer={player.id === playerId}
                        mapData={mapData}
                        players={gameState.players}
                        roomId={roomId}
                    />
                )
                }

                {showGameOver && (
                    <GameOverModal
                        winner={winner}
                        onRestart={handleRestart}
            />
        )}
            </React.Fragment>
        ))}
    </div>
    );
}

PlayerController.propTypes = {
   playerId: PropTypes.string.isRequired,
   playerName: PropTypes.string.isRequired,
   initialPosition: PropTypes.shape({
       x: PropTypes.number.isRequired,
       y: PropTypes.number.isRequired,
   }).isRequired,
   mapData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
   tankColor: PropTypes.oneOf(['Azul', 'Verde', 'Morado', 'Amarillo']).isRequired,
};

export default PlayerController;
