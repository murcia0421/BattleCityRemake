import React, { useState, useEffect, useCallback, useMemo } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Bullet from '../components/Bullets/Bullet';
import Player from '../components/Player/Player';
import CollisionUtils from '../utils/collisionUtils';
import mapDataLocal from '../components/Map/MapData';

export default function PlayerController({ playerId, initialPosition, mapData, socketId }) {
    const [player, setPlayer] = useState({ 
        id: playerId, 
        position: initialPosition, 
        direction: 'down' 
    });
    
    const [allPlayers, setAllPlayers] = useState({
        [playerId]: { id: playerId, position: initialPosition, direction: 'down' }
    });
    
    const [bullets, setBullets] = useState([]);
    
    // Memorizar la instancia de CollisionUtils para que no cambie en cada render
    const collisionUtils = useMemo(() => new CollisionUtils(mapDataLocal), []); // Eliminamos la dependencia de mapDataLocal

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
                // Crear el socket usando el socketId
                socket = new SockJS(`http://localhost:8080/battle-city-websocket/${socketId}`);
                client = Stomp.over(() => socket);

                // Conecta el cliente STOMP con el ID de la sala
                client.connect({}, () => {
                    console.log(`WebSocket connected to room ${socketId}`);
                    setIsConnected(true);
                    setStompClient(client);

                    // Suscripciones y lógica adicional
                    client.subscribe(`/topic/${socketId}/game-updates`, (message) => {
                        const gameState = JSON.parse(message.body);
                        handleGameState(gameState);
                    });

                    // Anunciar que el jugador se ha unido a la sala
                    client.send(`/app/${socketId}/player-join`, {}, JSON.stringify({
                        id: playerId,
                        position: initialPosition,
                        direction: 'down'
                    }));
                }, (error) => {
                    console.error('WebSocket connection error:', error);
                    setIsConnected(false);
                    setTimeout(connectWebSocket, 5000);
                });
            } catch (error) {
                console.error('Error setting up WebSocket:', error);
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        // Cleanup al desconectar
        return () => {
            if (client && client.connected) {
                client.send(`/app/${socketId}/player-disconnect`, {}, JSON.stringify({ id: playerId }));
                client.disconnect();
            }
            if (socket) {
                socket.close();
            }
        };
    }, [playerId, initialPosition, socketId]);

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

        console.log(bullets);

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
    }, [collisionUtils]); // Agregar collisionUtils como dependencia

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
