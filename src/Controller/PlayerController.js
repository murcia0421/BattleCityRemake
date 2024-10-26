import React, { useState, useEffect } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Bullet from '../components/Bullets/Bullet';
import Player from '../components/Player/Player';
import CollisionUtils from '../utils/collisionUtils';

export default function PlayerController({ playerId, initialPosition, mapData }) {
    const [player, setPlayer] = useState({
        id: playerId,
        position: initialPosition,
        direction: 'up'
    });
    const [bullets, setBullets] = useState([]);
    const collisionUtils = new CollisionUtils(mapData);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:3001/battle-city-websocket');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            client.subscribe('/topic/game-updates', (message) => {
                const updatedState = JSON.parse(message.body);
                console.log('+++++++updateplayers+++++++',updatedState);
                const updatedPlayer = updatedState.players ? updatedState.players[player.id] : undefined;

                if (updatedPlayer) {
                    setPlayer((prev) => ({
                        ...prev,
                        position: updatedPlayer.position,
                        direction: updatedPlayer.direction
                    }));
                }
            });
        }, (error) => {
            console.error('Error de conexión:', error);
        });

        setStompClient(client);

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [player.id]);

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
        const newPosition = { ...player.position };
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

        if (!collisionUtils.checkCollision(newPosition)) {
            setPlayer((prev) => ({
                ...prev,
                position: newPosition,
                direction
            }));
            if (stompClient && stompClient.connected) {
                console.info('.....Conexión WebSocket establecida correctamente....');
                stompClient.send('/app/player-action', {}, JSON.stringify({
                    playerId: player.id,
                    type: 'MOVE',
                    position: newPosition,
                    direction
                }));
            }else {
                console.error('----->Error: No hay conexión WebSocket activa<------');
            }
        }
        /*if (stompClient && stompClient.connected) {
            console.info('.....Conexión WebSocket establecida correctamente....');
            stompClient.send('/app/player-action', {}, JSON.stringify({
                playerId: player.id,
                type: 'MOVE',
                position: newPosition,
                direction
            }));
        }else {
            console.error('----->Error: No hay conexión WebSocket activa<------');
        }*/
    };

    const shootBullet = () => {
        console.error('----->Error: disparo<------');
        const bullet = {
            id: Date.now(),
            position: { ...player.position.x, ...player.position.y  },
            direction: player.direction
        };
        setBullets((prevBullets) => [...prevBullets, bullet]);

        if (stompClient && stompClient.connected) {
            stompClient.send('/app/player-action', {}, JSON.stringify({
                playerId: player.id,
                type: 'SHOOT',
                bullet
            }));
        }
    };

    usePlayerInput(handlePlayerAction);

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets((prevBullets) =>
                prevBullets
                    .map((bullet) => {
                        const newPosition = { ...bullet.position };
                        switch (bullet.direction) {
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
                    })
                    .filter((bullet) => bullet.position.x >= 0 && bullet.position.y >= 0)
            );
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <Player id={player.id} position={player.position} direction={player.direction} />
            {bullets.map((bullet) => (
                <Bullet key={bullet.id} {...bullet} />
            ))}
        </div>
    );
}

