import React, { useState, useEffect } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Bullet from './Bullet';
import Tank from './Tank';  // Import Tank component
//import { mapData, isWall } from './map';

export default function PlayerController({ mapData }) {
    const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
    const [playerDirection, setPlayerDirection] = useState('up');
    const [bullets, setBullets] = useState([]); // Estado para almacenar los proyectiles activos
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        console.log('Conectando a WebSocket...');
        const socket = new SockJS('http://localhost:3001/battle-city-websocket');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            //console.log('Conectado a WebSocket');
            client.subscribe('/topic/game-updates', (message) => {
                const updatedState = JSON.parse(message.body);
                const playerId = 'playerId1';
                const player = updatedState.players ? updatedState.players[playerId] : undefined;
                if (player) {
                    //console.log("Datos recibidos del servidor:", player);
                    //setPlayerPosition({ x: player.x, y: player.y });
                    //setPlayerDirection(player.direction);w
                    //console.log('Estado del jugador actualizado desde WebSocket:', player);
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
        //console.log('Acción enviada al servidor:', actionWithId);

        // Actualiza la dirección solo si el jugador se mueve
        if (action.type === 'MOVE') {
            movePlayer(action.direction);
            //setPlayerDirection(action.direction); // Actualiza la dirección del tanque
        }

        if (action.type === 'SHOOT') {
            const bullet = createBullet(playerPosition, playerDirection);
            setBullets([...bullets, bullet]); // Añadir el nuevo proyectil al estado de los proyectiles
        }

        if (stompClient && stompClient.connected) {
            stompClient.send('/app/player-action', {}, JSON.stringify(actionWithId));
        }
    };


    const movePlayer = (direction) => {
        let newX = playerPosition.x;
        let newY = playerPosition.y;

        console.log(`Intentando mover el tanque en la dirección: ${direction}`);

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

        // Verificar si la nueva posición está ocupada por un muro antes de mover el tanque
        if (!isWall(newX, newY)) {
            //console.log(`Movimiento permitido hacia (${newX}, ${newY})`);
            setPlayerPosition({ x: newX, y: newY });
            setPlayerDirection(direction);
        } else {
            console.log(`Movimiento bloqueado hacia (${newX}, ${newY}) debido a un muro.`);
        }
    };


    const isWall = (x, y) => {
        //console.log(`Verificando si hay un muro en la posición (${x}, ${y})`);

        // Comprobación de límites del mapa
        if (x < 0 || x >= mapData[0].length || y < 0 || y >= mapData.length) {
            console.log(`Posición (${x}, ${y}) está fuera de los límites del mapa.`);
            return true; // Fuera del rango se considera un muro
        }

        const tile = mapData[y][x];
        console.log(`----Tile---->: ${tile}`);
        const esMuro = tile === 1 || tile === 2; // 1 = muro de ladrillo, 2 = muro de acero

        //console.log(`Revisando colisión en posición (${x}, ${y}): ${esMuro ? 'Muro encontrado' : 'No hay muro'}`);
        return esMuro;
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


    return (
        <div>
            <p>Controla al jugador con las teclas de w, a, s, d. Presiona Espacio para disparar.</p>
            {playerPosition && playerDirection && (
                <Tank x={playerPosition.x} y={playerPosition.y} direction={playerDirection} />
            )}
            {/*console.log('Renderizando tanque en posición:', playerPosition, 'con dirección:', playerDirection)*/}

            {bullets.map((bullet, index) => (
                <Bullet key={index} x={bullet.x} y={bullet.y} direction={bullet.direction} />
            ))}

        </div>
    );
}
