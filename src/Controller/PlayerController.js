import React, { useState, useEffect } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Bullet from '../components/Bullets/Bullet';
import Player from '../components/Player/Player';
import CollisionUtils from '../utils/collisionUtils';
import mapDataLocal from '../components/Map/MapData';

export default function PlayerController({ playerId, initialPosition, mapData }) {
    /*console.warn('playerId-->: ', playerId);
    console.warn('initialPosition--->: ', initialPosition);
    console.warn('mapData--->: ', mapDataLocal);*/
    //Jugador
    const [player, setPlayer] = useState({ id: playerId, position: initialPosition, direction: 'down' });

    const [bullets, setBullets] = useState([]);
    //const collisionUtils = new CollisionUtils(mapData);
    const collisionUtils = new CollisionUtils(mapDataLocal);
    const [stompClient, setStompClient] = useState(null);

    //console.warn('ubicación inicial',player.position.x, player.position.y);

    useEffect(() => {
        const socket = new SockJS('http://localhost:3001/battle-city-websocket');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            client.subscribe('/topic/game-updates', (message) => {
                const updatedState = JSON.parse(message.body);
                //console.log('+++++++updateplayers+++++++',updatedState);
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
            //console.error('Error de conexión:', error);
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
        /*console.warn('is collisint1:',collisionUtils.checkCollision(player.position));
        console.warn('position:',player.position);
        console.warn('map X:',mapDataLocal[player.position.x][player.position.y]); */   
        
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
        if (!collisionUtils.checkCollision({x: newX, y: newY})) // Siguiente posición no es muro
        {
            setPlayer((prev) => ({
                ...prev,
                position: {x: newX, y: newY},
                direction
            }));
    
            if (stompClient && stompClient.connected) {
                stompClient.send('/app/player-action', {}, JSON.stringify({
                    playerId: player.id,
                    type: 'MOVE',
                    position: {x: newX, y: newY},
                    direction
                }));
            }else {
                console.error('----->Error: No hay conexión WebSocket activa<------');
            }
        }
        
    };

    const shootBullet = () => {
        //console.error('----->Error: disparo<------');
        const bullet = {id: Date.now(), x: player.position.x, y: player.position.y, direction: player.direction };

        setBullets((prevBullets) => [...prevBullets, bullet]);

        if (stompClient && stompClient.connected) {
            stompClient.send('/app/player-action', {}, JSON.stringify({
                playerId: player.id,
                type: 'SHOOT',
                bullet
            }));
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets((prevBullets) =>
                prevBullets
                    .map((bullet) => {
                        let { x, y, direction } = bullet;
                        // Mueve la bala según la dirección
                        switch (direction) {
                            case 'up':
                                y -= 1;
                                break;
                            case 'down':
                                y += 1;
                                break;
                            case 'left':
                                x -= 1;
                                break;
                            case 'right':
                                x += 1;
                                break;
                            default:
                                break;
                        }
    
                        // Verifica si la bala colisiona o sale del mapa
                        if (collisionUtils.checkCollision({ x, y }) || x < 0 || x >= mapDataLocal[0].length || y < 0 || y >= mapDataLocal.length) {
                            return null; // La bala se elimina si hay colisión o sale del mapa
                        }
    
                        return { ...bullet, x, y }; // Actualiza la posición de la bala
                    })
                    .filter(Boolean) // Elimina balas nulas (las que colisionaron o salieron del mapa)
            );
        }, 100); // Intervalo de 100 ms para actualizar la posición de la bala
    
        return () => clearInterval(interval); // Limpia el intervalo cuando se desmonta el componente
    }, [bullets]);

    usePlayerInput(handlePlayerAction);

    return (
        <div>
            <Player id={player.id} position={player.position} direction={player.direction} />
            {bullets.map((bullet) => (
                <Bullet key={bullet.id} x={bullet.x} y={bullet.y} direction={bullet.direction} />
            ))}
        </div>
    );
}

