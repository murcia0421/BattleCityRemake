import React, { useState, useEffect } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Bullet from './Bullet';
import Tank from './Tank';  // Import Tank component
import { mapData, isWall } from './map';

export default function PlayerController() {
    const [playerPosition, setPlayerPosition] = useState({ x: 2, y: 2 });
    const [playerDirection, setPlayerDirection] = useState('up');
    const [bullets, setBullets] = useState([]); // Estado para almacenar los proyectiles activos
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        console.log('Conectando a WebSocket...');
        const socket = new SockJS('http://localhost:3001/battle-city-websocket');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('Conectado a WebSocket');
            client.subscribe('/topic/game-updates', (message) => {
                const updatedState = JSON.parse(message.body);
                const playerId = 'playerId1';
                const player = updatedState.players ? updatedState.players[playerId] : undefined;
                if (player) {
                    console.log("Datos recibidos del servidor:", player);
                    setPlayerPosition({ x: player.x, y: player.y });
                    //setPlayerDirection(player.direction);w
                    console.log('Estado del jugador actualizado desde WebSocket:', player);
                } else {
                    console.error('Datos de posición o dirección no definidos en player:', player);
                }
            });
            
        }, (error) => {
            console.error('Error al conectar:', error);
        });

        setStompClient(client);

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, []);

    const handlePlayerAction = (action) => {
        const playerId = 'playerId1'; // Debe ser el ID del jugador actual
        const actionWithId = { ...action, playerId };
        console.log('Acción enviada al servidor:', actionWithId);
    
        // Actualiza la dirección y la posición si el jugador se mueve
        if (action.type === 'MOVE') {
            setPlayerDirection(action.direction); // Actualiza la dirección del tanque
    
            // Calcula la nueva posición basada en la dirección
            setPlayerPosition((prevPosition) => {
                let newPosition = { ...prevPosition };
                switch (action.direction) {
                    case 'up':
                        newPosition.y = prevPosition.y - 1;
                        break;
                    case 'down':
                        newPosition.y = prevPosition.y + 1;
                        break;
                    case 'left':
                        newPosition.x = prevPosition.x - 1;
                        break;
                    case 'right':
                        newPosition.x = prevPosition.x + 1;
                        break;
                    default:
                        break;
                }
                // Revisa si el nuevo movimiento no es hacia un muro
                if (!isWall(newPosition.x, newPosition.y)) {
                    return newPosition;
                } else {
                    return prevPosition; // Si es un muro, el tanque no se mueve
                }
            });
        }
    
        if (action.type === 'SHOOT') {
            const bullet = createBullet(playerPosition, playerDirection);
            setBullets([...bullets, bullet]); // Añadir el nuevo proyectil al estado de los proyectiles
        }
    
        if (stompClient && stompClient.connected) {
            stompClient.send('/app/player-action', {}, JSON.stringify(actionWithId));
        }
    };
    
    

    const createBullet = (position, direction) => {
        return { x: position.x, y: position.y, direction: direction };
    };

    usePlayerInput(handlePlayerAction);

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets((prevBullets) =>
                prevBullets.map((bullet) => moveBullet(bullet)).filter((bullet) => isBulletOnBoard(bullet))
            );
        }, 100); // Actualizar la posición de los proyectiles cada 100ms

        return () => clearInterval(interval);
    }, []);

    const moveBullet = (bullet) => {
        switch (bullet.direction) {
            case 'up':
                return { ...bullet, y: bullet.y - 1 };
            case 'down':
                return { ...bullet, y: bullet.y + 1 };
            case 'left':
                return { ...bullet, x: bullet.x - 1 };
            case 'right':
                return { ...bullet, x: bullet.x + 1 };
            default:
                return bullet;
        }
    };

    const isBulletOnBoard = (bullet) => {
        return bullet.x >= 0 && bullet.x < 26 && bullet.y >= 0 && bullet.y < 26; // Dimensiones del tablero
    };

    const isWall = (x, y) => {
        // Asegúrate de que las coordenadas estén dentro del rango del mapa
        if (x < 0 || x >= mapData[0].length || y < 0 || y >= mapData.length) {
            return true; // Fuera del rango se considera un muro
        }
        return mapData[y][x] === 1 || mapData[y][x] === 2; // Muro de ladrillo o acero
    };

    return (
        <div>
            <p>Controla al jugador con las teclas de w, a, s, d. Presiona Espacio para disparar.</p>
            {playerPosition && playerDirection && (
                <Tank x={playerPosition.x} y={playerPosition.y} direction={playerDirection} />
            )}
            {console.log('Renderizando tanque en posición:', playerPosition, 'con dirección:', playerDirection)}

            {bullets.map((bullet, index) => (
                <Bullet key={index} x={bullet.x} y={bullet.y} direction={bullet.direction} />
            ))}

        </div>
    );
}
