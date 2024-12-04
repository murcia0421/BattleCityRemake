import { Client } from '@stomp/stompjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Player from '../components/Player/Player';
import usePlayerInput from '../hooks/usePlayerInput';
import CollisionUtils from '../utils/collisionUtils';
import BulletController from './BulletController';
const MOVEMENT_SPEED = 0.1;

function PlayerController({ playerId, playerName, initialPosition, mapData, tankColor }) {
   const [gameState, setGameState] = useState({
       players: {
           [playerId]: { 
               id: playerId, 
               name: playerName, 
               position: initialPosition, 
               direction: 'down', 
               tankColor: tankColor,
               // Nuevas propiedades para PvP
               lives: 3,
               isAlive: true 
           }
       },
   });
   const [stompClient, setStompClient] = useState(null);
   const [isConnected, setIsConnected] = useState(false);
   // Estado para manejar respawn
   const [respawnTimer, setRespawnTimer] = useState(null);
   const collisionUtils = new CollisionUtils(mapData);
   const bulletControllerRef = useRef(null);

   // Función para manejar respawn
   
   const handleRespawn = useCallback(() => {
       if (!stompClient?.connected) return;

       stompClient.publish({
           destination: '/app/player-respawn',
           body: JSON.stringify({
               type: 'PLAYER_RESPAWN',
               playerId
           })
       });
   }, [stompClient, playerId]); 

   const handleGameUpdate = useCallback((message) => {
       if (!message?.body) return;
       try {
           const update = JSON.parse(message.body);
           console.log('Actualización recibida:', update);
           console.log("Players para si son nulos" ,gameState.players);
   
           switch (update.type) {
            case 'PLAYER_MOVE':
                if (update.playerId !== playerId) {
                    setGameState(prev => {
                        const updatedPlayer = {
                            ...prev.players[update.playerId],
                            id: update.playerId,  // Asegurar que el ID se mantiene
                            position: update.position,
                            direction: update.direction,
                            tankColor: update.tankColor,
                            lives: prev.players[update.playerId]?.lives || 3,
                            isAlive: prev.players[update.playerId]?.isAlive !== undefined ? 
                                prev.players[update.playerId].isAlive : true,
                            name: prev.players[update.playerId]?.name || update.playerId
                        };
            
                        return {
                            ...prev,
                            players: {
                                ...prev.players,
                                [update.playerId]: updatedPlayer
                            }
                        };
                    });
                }
                break;
            
            case 'PLAYER_JOIN':
                console.log('Jugador uniéndose:', update.player);
                setGameState(prev => {
                    const newPlayer = {
                        id: update.player.id,  // El ID debe mantenerse
                        name: update.player.name,
                        position: update.player.position,
                        direction: update.player.direction,
                        tankColor: update.player.tankColor,
                        lives: update.player.lives || 3,
                        isAlive: update.player.isAlive !== undefined ? update.player.isAlive : true
                    };
            
                    return {
                        ...prev,
                        players: {
                            ...prev.players,
                            [newPlayer.id]: newPlayer  // Usar el ID para la clave
                        }
                    };
                });
                break;
                
               case 'PLAYER_HIT':
                   if (update.playerId === playerId) {
                       setGameState(prev => ({
                           ...prev,
                           players: {
                               ...prev.players,
                               [playerId]: {
                                   ...prev.players[playerId],
                                   lives: update.lives
                               }
                           }
                       }));
                   }
                   break;
               case 'PLAYER_ELIMINATED':
                   if (update.playerId === playerId) {
                       setGameState(prev => ({
                           ...prev,
                           players: {
                               ...prev.players,
                               [playerId]: {
                                   ...prev.players[playerId],
                                   lives: 0,
                                   isAlive: false
                               }
                           }
                       }));
                       setRespawnTimer(setTimeout(handleRespawn, 5000));
                   }
                   break;
               case 'PLAYER_RESPAWN':
                   if (update.playerId === playerId) {
                       setGameState(prev => ({
                           ...prev,
                           players: {
                               ...prev.players,
                               [playerId]: {
                                   ...prev.players[playerId],
                                   lives: update.lives,
                                   isAlive: true
                               }
                           }
                       }));
                   }
                   break;
           }
       } catch (error) {
           console.error('Error procesando mensaje:', error);
       }
   }, [playerId]);

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

           client.subscribe('/topic/game-updates', handleGameUpdate);

           client.publish({
               destination: '/app/game-join',
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
           if (respawnTimer) clearTimeout(respawnTimer);
       };
   }, [playerId, playerName, initialPosition, tankColor, handleGameUpdate]);

   const movePlayer = useCallback((direction) => {
       if (!stompClient?.connected || !isConnected) return;
       
       const currentPlayer = gameState.players[playerId];
       if (!currentPlayer || !currentPlayer.isAlive) return;
       
       let newX = currentPlayer.position.x;
       let newY = currentPlayer.position.y;
       
       switch (direction) {
           case 'up': newY -= MOVEMENT_SPEED; break;
           case 'down': newY += MOVEMENT_SPEED; break;
           case 'left': newX -= MOVEMENT_SPEED; break;
           case 'right': newX += MOVEMENT_SPEED; break;
       }

       const corners = [
           { x: Math.floor(newX), y: Math.floor(newY) },
           { x: Math.floor(newX + 0.8), y: Math.floor(newY) },
           { x: Math.floor(newX), y: Math.floor(newY + 0.8) },
           { x: Math.floor(newX + 0.8), y: Math.floor(newY + 0.8) }
       ];

       const hasCollision = corners.some(corner => {
           if (corner.x < 0 || corner.x >= mapData[0].length || 
               corner.y < 0 || corner.y >= mapData.length) {
               return true;
           }
           return collisionUtils.checkCollision(corner);
       });

       if (!hasCollision) {
           const newPosition = { x: newX, y: newY };
           setGameState(prev => ({
               ...prev,
               players: {
                   ...prev.players,
                   [playerId]: {
                       ...currentPlayer,
                       position: newPosition,
                       direction,
                   }
               }
           }));

           stompClient.publish({
            destination: '/app/game-move',
            body: JSON.stringify({
                type: 'PLAYER_MOVE',
                playerId: currentPlayer.id,  // Asegurar que enviamos el ID correcto
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
                       direction,
                   }
               }
           }));

           stompClient.publish({
               destination: '/app/game-move',
               body: JSON.stringify({
                   type: 'PLAYER_MOVE',
                   playerId,
                   position: currentPlayer.position,
                   direction,
                   tankColor: currentPlayer.tankColor
               })
           });
       }
   }, [playerId, stompClient, isConnected, gameState.players, collisionUtils, mapData]);

   usePlayerInput(action => {
       switch(action.type) {
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