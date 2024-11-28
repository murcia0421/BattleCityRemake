import { Stomp } from '@stomp/stompjs';
import React, { useCallback, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Bullet from '../components/Bullets/Bullet';
import mapDataLocal from '../components/Map/MapData';
import Player from '../components/Player/Player';
import CollisionUtils from '../utils/collisionUtils';

export default function PlayerController({ playerId, initialPosition, roomName }) {
    const [player, setPlayer] = useState({ id: playerId, position: initialPosition, direction: 'down' });
    const [allPlayers, setAllPlayers] = useState({
        [playerId]: { id: playerId, position: initialPosition, direction: 'down', connected: true }
    });
    const [bullets, setBullets] = useState([]);
    const collisionUtils = new CollisionUtils(mapDataLocal);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const handleGameState = useCallback((gameState) => {
        switch (gameState.type) {
            case 'PLAYER_JOIN':
                setAllPlayers(prev => ({
                    ...prev,
                    [gameState.playerId]: { ...gameState.player, connected: true }
                }));
                break;

            case 'PLAYER_UPDATE':
                setAllPlayers(prev => ({
                    ...prev,
                    [gameState.playerId]: {
                        ...prev[gameState.playerId],
                        position: gameState.position,
                        direction: gameState.direction
                    }
                }));
                break;

            case 'BULLET_UPDATE':
                setBullets(gameState.bullets);
                break;

            case 'PLAYER_DISCONNECT':
                setAllPlayers(prev => {
                    const newPlayers = { ...prev };
                    if (newPlayers[gameState.playerId]) {
                        newPlayers[gameState.playerId].connected = false;
                    }
                    return newPlayers;
                });
                break;

            case 'STATE_UPDATE':
                setAllPlayers(prev => {
                    const updatedPlayers = { ...prev };
                    Object.keys(gameState.players).forEach(playerId => {
                        updatedPlayers[playerId] = { ...gameState.players[playerId], connected: prev[playerId]?.connected ?? true };
                    });
                    return updatedPlayers;
                });
                setBullets(gameState.bullets);
                break;

            default:
                console.warn('Unknown game state type:', gameState.type);
        }
    }, []);

    useEffect(() => {
        let client = null;
        const connectWebSocket = () => {
            const socket = new SockJS('http://localhost:3001/battle-city-websocket');
            client = Stomp.over(socket);

            client.connect({}, () => {
                setIsConnected(true);
                setStompClient(client);
                client.subscribe('/topic/game-updates', (message) => {
                    const gameState = JSON.parse(message.body);
                    handleGameState(gameState);
                });
                client.send('/app/player-join', {}, JSON.stringify({
                    id: playerId,
                    roomName,
                    position: initialPosition,
                    direction: 'down'
                }));
            }, () => {
                console.error('WebSocket connection error');
                setIsConnected(false);
                setTimeout(connectWebSocket, 5000);  // Reconnection attempt
            });
        };

        connectWebSocket();

        return () => {
            if (client && client.connected) {
                client.send('/app/player-disconnect', {}, JSON.stringify({ id: playerId, roomName }));
                client.disconnect();
            }
        };
    }, [playerId, roomName, initialPosition, handleGameState]);

    return (
        <div>
            {Object.values(allPlayers)
                .filter(playerData => playerData.connected)
                .map(playerData => (
                    <Player
                        key={playerData.id}
                        id={playerData.id}
                        position={playerData.position}
                        direction={playerData.direction}
                        isCurrentPlayer={playerData.id === playerId}
                    />
                ))}
            {bullets.map(bullet => (
                <Bullet key={bullet.id} x={bullet.x} y={bullet.y} direction={bullet.direction} />
            ))}
        </div>
    );
}
