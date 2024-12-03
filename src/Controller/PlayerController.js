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
                tankColor: tankColor 
            }
        },
    });
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const collisionUtils = new CollisionUtils(mapData);
    const bulletControllerRef = useRef(null);

    const handleGameUpdate = useCallback((message) => {
        if (!message?.body) return;
        try {
            const update = JSON.parse(message.body);
            console.log('Actualización recibida:', update);
    
            switch (update.type) {
                case 'PLAYER_MOVE':
                    if (update.playerId !== playerId) {
                        setGameState(prev => ({
                            ...prev,
                            players: {
                                ...prev.players,
                                [update.playerId]: {
                                    ...prev.players[update.playerId],
                                    position: update.position,
                                    direction: update.direction,
                                    tankColor: update.tankColor
                                }
                            }
                        }));
                    }
                    break;
                case 'PLAYER_JOIN':
                    console.log('Jugador uniéndose:', update.player);
                    setGameState(prev => ({
                        ...prev,
                        players: {
                            ...prev.players,
                            [update.player.id]: {
                                ...update.player,
                                tankColor: update.player.tankColor
                            }
                        }
                    }));
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
                        tankColor: tankColor
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
        if (!currentPlayer) return;
        
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
                    playerId,
                    position: newPosition,
                    direction,
                    tankColor: currentPlayer.tankColor
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
                    />
                    <BulletController
                        ref={bulletControllerRef}
                        playerId={player.id}
                        stompClient={stompClient}
                        playerPosition={player.position}
                        playerDirection={player.direction}
                        isCurrentPlayer={player.id === playerId}
                        mapData={mapData}
                    />
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