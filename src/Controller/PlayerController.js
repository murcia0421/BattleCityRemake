import { Client } from '@stomp/stompjs';
import React, { useCallback, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Player from '../components/Player/Player'; // Asegúrate de tener este componente
import usePlayerInput from '../hooks/usePlayerInput'; // Asegúrate de que funcione correctamente
import CollisionUtils from '../utils/collisionUtils'; // Para verificar colisiones

const MOVEMENT_SPEED = 0.1;

export default function PlayerController({ playerId, playerName, initialPosition, mapData }) {
    const [gameState, setGameState] = useState({
        players: {
            [playerId]: { id: playerId, name: playerName, position: initialPosition, direction: 'down' }
        },
    });
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const collisionUtils = new CollisionUtils(mapData);

    // Manejar actualizaciones de mensajes del servidor
    const handleGameUpdate = useCallback((message) => {
        if (!message || !message.body) return;

        try {
            const update = JSON.parse(message.body);
            switch (update.type) {
                case 'PLAYER_MOVE':
                    setGameState(prev => ({
                        ...prev,
                        players: {
                            ...prev.players,
                            [update.playerId]: {
                                ...prev.players[update.playerId],
                                position: update.position,
                                direction: update.direction,
                            }
                        }
                    }));
                    break;
                case 'PLAYER_JOIN':
                    setGameState(prev => ({
                        ...prev,
                        players: {
                            ...prev.players,
                            [update.player.id]: update.player,
                        }
                    }));
                    break;
                default:
                    console.log('Mensaje desconocido:', update);
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    }, []);

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
                    player: { id: playerId, name: playerName, position: initialPosition, direction: 'down' }
                })
            });
        };

        client.onDisconnect = () => setIsConnected(false);
        client.onStompError = (error) => console.error('Error STOMP:', error);

        client.activate();

        return () => {
            if (client.connected) client.deactivate();
        };
    }, [playerId, playerName, initialPosition, handleGameUpdate]);

    const movePlayer = useCallback((direction) => {
        const currentPlayer = gameState.players[playerId];
        let newX = currentPlayer.position.x;
        let newY = currentPlayer.position.y;

        switch (direction) {
            case 'up': newY -= MOVEMENT_SPEED; break;
            case 'down': newY += MOVEMENT_SPEED; break;
            case 'left': newX -= MOVEMENT_SPEED; break;
            case 'right': newX += MOVEMENT_SPEED; break;
        }

        if (!collisionUtils.checkCollision({ x: Math.floor(newX), y: Math.floor(newY) })) {
            const newPosition = { x: newX, y: newY };

            stompClient.publish({
                destination: '/app/game-move',
                body: JSON.stringify({
                    type: 'PLAYER_MOVE',
                    playerId,
                    position: newPosition,
                    direction,
                })
            });

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
        }
    }, [playerId, stompClient, gameState.players, collisionUtils]);

    // Hook para capturar entrada del jugador
    usePlayerInput(action => {
        if (action.type === 'MOVE') movePlayer(action.direction);
    });

    return (
        <div className="game-container">
            {Object.values(gameState.players).map(player => (
                <Player key={player.id} {...player} isCurrentPlayer={player.id === playerId} />
            ))}
        </div>
    );
}
