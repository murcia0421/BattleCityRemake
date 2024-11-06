import React, { useState, useEffect, useCallback } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Bullet from '../components/Bullets/Bullet';
import Player from '../components/Player/Player';
import CollisionUtils from '../utils/collisionUtils';
import mapDataLocal from '../components/Map/MapData';

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

    // Función para enviar mensajes de forma segura
    const sendMessage = useCallback((destination, body) => {
        if (stompClient && isConnected) {
            try {
                stompClient.send(destination, {}, JSON.stringify(body));
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.warn('WebSocket not connected, message not sent');
        }
    }, [stompClient, isConnected]);

    // Configuración de WebSocket
    useEffect(() => {
        let client = null;
        let socket = null;

        const connectWebSocket = () => {
            try {
                // Crear socket y cliente STOMP
                socket = new SockJS('http://localhost:3001/battle-city-websocket');
                client = Stomp.over(function() {
                    return socket;
                });

                // Configurar opciones de STOMP
                client.reconnect_delay = 5000;
                
                // Desactivar logs
                client.debug = () => {};

                const onConnect = () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                    setStompClient(client);

                    // Suscribirse a actualizaciones
                    client.subscribe('/topic/game-updates', (message) => {
                        try {
                            const gameState = JSON.parse(message.body);
                            handleGameState(gameState);
                        } catch (error) {
                            console.error('Error processing message:', error);
                        }
                    });

                    // Anunciar que el jugador se ha unido
                    client.send('/app/player-join', {}, JSON.stringify({
                        id: playerId,
                        position: initialPosition,
                        direction: 'down'
                    }));
                };

                const onError = (error) => {
                    console.error('WebSocket connection error:', error);
                    setIsConnected(false);
                    setTimeout(connectWebSocket, 5000);
                };

                // Conectar con callbacks separados
                client.connect({}, onConnect, onError);

            } catch (error) {
                console.error('Error setting up WebSocket:', error);
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        // Cleanup
        return () => {
            if (client && client.connected) {
                try {
                    client.send('/app/player-disconnect', {}, JSON.stringify({ id: playerId }));
                    client.disconnect();
                } catch (error) {
                    console.error('Error during cleanup:', error);
                }
            }
            if (socket) {
                socket.close();
            }
        };
    }, [playerId, initialPosition]);

    // El resto del código permanece igual...
    const handleGameState = (gameState) => {
        switch (gameState.type) {
            case 'PLAYER_UPDATE':
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
            default:
                console.warn('Unknown game state type:', gameState.type);
        }
    };

    const handlePlayerAction = (action) => {
        switch (action.type) {
            case 'MOVE':
                movePlayer(action.direction);
                break;
            case 'SHOOT':
                shootBullet();
                break;
            default:
                break;
        }
    };

    const movePlayer = (direction) => {
        let newX = player.position.x;
        let newY = player.position.y;

        switch (direction) {
            case 'up':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                break;
            case 'right':
                newX += 1;
                break;
            default:
                break;
        }

        if (!collisionUtils.checkCollision({x: newX, y: newY})) {
            const newPosition = { x: newX, y: newY };
            
            setPlayer(prev => ({
                ...prev,
                position: newPosition,
                direction
            }));

            sendMessage('/app/player-action', {
                type: 'PLAYER_UPDATE',
                playerId,
                position: newPosition,
                direction
            });
        }
    };

    const shootBullet = () => {
        const bullet = {
            id: `${playerId}-${Date.now()}`,
            x: player.position.x,
            y: player.position.y,
            direction: player.direction,
            playerId
        };

        setBullets(prev => [...prev, bullet]);
        sendMessage('/app/player-action', {
            type: 'BULLET_UPDATE',
            playerId,
            bullet
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets(prevBullets =>
                prevBullets
                    .map(bullet => {
                        let { x, y, direction } = bullet;
                        
                        switch (direction) {
                            case 'up': y -= 1; break;
                            case 'down': y += 1; break;
                            case 'left': x -= 1; break;
                            case 'right': x += 1; break;
                            default: break;
                        }

                        if (collisionUtils.checkCollision({ x, y }) || 
                            x < 0 || x >= mapDataLocal[0].length || 
                            y < 0 || y >= mapDataLocal.length) {
                            return null;
                        }

                        return { ...bullet, x, y };
                    })
                    .filter(Boolean)
            );
        }, 100);

        return () => clearInterval(interval);
    }, []);

    usePlayerInput(handlePlayerAction);

    return (
        <div>
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