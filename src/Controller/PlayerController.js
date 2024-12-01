import { Stomp } from '@stomp/stompjs';
import React, { useCallback, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Bullet from '../components/Bullets/Bullet';
import mapDataLocal from '../components/Map/MapData';
import Player from '../components/Player/Player';
import usePlayerInput from '../hooks/usePlayerInput';
import CollisionUtils from '../utils/collisionUtils';

const TILE_SIZE = 32;
const MOVEMENT_SPEED = 1;
const BULLET_SPEED = 0.15;

export default function PlayerController({ playerId, initialPosition, mapData }) {
    const [player, setPlayer] = useState({ 
        id: playerId, 
        position: initialPosition,
        direction: 'down' 
    });
    
    const [allPlayers, setAllPlayers] = useState({
        [playerId]: { id: playerId, position: initialPosition, direction: 'down' }
    });
    
    const [bullets, setBullets] = useState([]);
    const collisionUtils = new CollisionUtils(mapDataLocal);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const handleGameState = useCallback((gameState) => {
        switch (gameState.type) {
            case 'PLAYER_UPDATE':
                setAllPlayers(prev => {
                    const updatedPlayers = {
                        ...prev,
                        [gameState.playerId]: {
                            ...prev[gameState.playerId],
                            position: gameState.position,
                            direction: gameState.direction
                        }
                    };
                    return updatedPlayers;
                });

                if (gameState.playerId === playerId) {
                    setPlayer(prev => ({
                        ...prev,
                        position: gameState.position,
                        direction: gameState.direction
                    }));
                }
                break;

            case 'PLAYER_JOIN':
                setAllPlayers(prev => ({
                    ...prev,
                    [gameState.playerId]: gameState.players[gameState.playerId]
                }));
                break;

            case 'BULLET_UPDATE':
                if (gameState.bullets) {
                    setBullets(gameState.bullets);
                }
                break;

            case 'PLAYER_DISCONNECT':
                setAllPlayers(prev => {
                    const newPlayers = { ...prev };
                    delete newPlayers[gameState.playerId];
                    return newPlayers;
                });
                break;

            case 'STATE_UPDATE':
                if (gameState.players) {
                    setAllPlayers(gameState.players);
                }
                if (gameState.bullets) {
                    setBullets(gameState.bullets);
                }
                break;
        }
    }, [playerId]);

    const sendMessage = useCallback((destination, body) => {
        if (stompClient && isConnected) {
            try {
                stompClient.send(destination, {}, JSON.stringify(body));
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }, [stompClient, isConnected]);

    useEffect(() => {
        let client = null;
        let socket = null;

        const connectWebSocket = () => {
            try {
                socket = new SockJS('http://localhost:3001/battle-city-websocket');
                client = Stomp.over(() => socket);

                client.reconnect_delay = 5000;
                client.debug = () => {};

                const onConnect = () => {
                    setIsConnected(true);
                    setStompClient(client);

                    client.subscribe('/topic/game-updates', (message) => {
                        try {
                            const gameState = JSON.parse(message.body);
                            handleGameState(gameState);
                        } catch (error) {
                            console.error('Error processing message:', error);
                        }
                    });

                    client.send('/app/player-join', {}, JSON.stringify({
                        id: playerId,
                        position: initialPosition,
                        direction: 'down'
                    }));
                };

                const onError = (error) => {
                    setIsConnected(false);
                    setTimeout(connectWebSocket, 5000);
                };

                client.connect({}, onConnect, onError);

            } catch (error) {
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        return () => {
            if (client && client.connected) {
                try {
                    client.send('/app/player-disconnect', {}, JSON.stringify({ 
                        id: playerId 
                    }));
                    client.disconnect();
                } catch (error) {
                    console.error('Error during cleanup:', error);
                }
            }
            if (socket) {
                socket.close();
            }
        };
    }, [playerId, initialPosition, handleGameState]);

    const movePlayer = useCallback((direction) => {
        setPlayer(prev => {
            let newX = prev.position.x;
            let newY = prev.position.y;

            switch (direction) {
                case 'up':
                    newY = newY - MOVEMENT_SPEED;
                    break;
                case 'down':
                    newY = newY + MOVEMENT_SPEED;
                    break;
                case 'left':
                    newX = newX - MOVEMENT_SPEED;
                    break;
                case 'right':
                    newX = newX + MOVEMENT_SPEED;
                    break;
            }

            const maxX = mapDataLocal[0].length - 1;
            const maxY = mapDataLocal.length - 1;
            newX = Math.max(0, Math.min(maxX, newX));
            newY = Math.max(0, Math.min(maxY, newY));

            const gridX = Math.floor(newX);
            const gridY = Math.floor(newY);

            if (!collisionUtils.checkCollision({ x: gridX, y: gridY })) {
                const newPosition = { x: newX, y: newY };
                
                setAllPlayers(prevPlayers => ({
                    ...prevPlayers,
                    [playerId]: {
                        ...prevPlayers[playerId],
                        position: newPosition,
                        direction
                    }
                }));

                sendMessage('/app/player-action', {
                    type: 'PLAYER_UPDATE',
                    playerId,
                    position: newPosition,
                    direction
                });

                return {
                    ...prev,
                    position: newPosition,
                    direction
                };
            }

            return {
                ...prev,
                direction
            };
        });
    }, [playerId, collisionUtils, sendMessage]);

    const shootBullet = useCallback(() => {
        let bulletX = player.position.x;
        let bulletY = player.position.y;

        switch (player.direction) {
            case 'up':
                bulletY -= 0.5;
                break;
            case 'down':
                bulletY += 0.5;
                break;
            case 'left':
                bulletX -= 0.5;
                break;
            case 'right':
                bulletX += 0.5;
                break;
        }

        const bullet = {
            id: `${playerId}-${Date.now()}`,
            x: bulletX,
            y: bulletY,
            direction: player.direction,
            playerId
        };

        setBullets(prev => [...prev, bullet]);
        sendMessage('/app/player-action', {
            type: 'BULLET_UPDATE',
            playerId,
            bullet
        });
    }, [player, playerId, sendMessage]);

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets(prevBullets =>
                prevBullets
                    .map(bullet => {
                        let { x, y, direction } = bullet;
                        
                        switch (direction) {
                            case 'up': y -= BULLET_SPEED; break;
                            case 'down': y += BULLET_SPEED; break;
                            case 'left': x -= BULLET_SPEED; break;
                            case 'right': x += BULLET_SPEED; break;
                            default: break;
                        }

                        // Verificar colisiones con paredes
                        const nextGridX = Math.floor(x);
                        const nextGridY = Math.floor(y);

                        if (collisionUtils.checkCollision({ x: nextGridX, y: nextGridY }) || 
                            x < 0 || x >= mapDataLocal[0].length || 
                            y < 0 || y >= mapDataLocal.length) {
                            return null;
                        }

                        return { ...bullet, x, y };
                    })
                    .filter(Boolean)
            );
        }, 16);

        return () => clearInterval(interval);
    }, []);

    const handlePlayerAction = useCallback((action) => {
        switch (action.type) {
            case 'MOVE':
                movePlayer(action.direction);
                break;
            case 'SHOOT':
                shootBullet();
                break;
        }
    }, [movePlayer, shootBullet]);

    usePlayerInput(handlePlayerAction);

    return (
        <div className="game-container">
            {Object.values(allPlayers).map(playerData => (
                <Player
                    key={playerData.id}
                    id={playerData.id}
                    position={playerData.position}
                    direction={playerData.direction}
                    isCurrentPlayer={playerData.id === playerId}
                />
            ))}
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    x={bullet.x}
                    y={bullet.y}
                    direction={bullet.direction}
                />
            ))}
        </div>
    );
}