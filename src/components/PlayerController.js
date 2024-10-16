import React, { useState, useEffect } from 'react';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Tank from './Tank';  // Import Tank component

export default function PlayerController() {
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
    const [playerDirection, setPlayerDirection] = useState('up');
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
                    setPlayerDirection(player.direction);
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
        if (stompClient && stompClient.connected) {
            stompClient.send('/app/player-action', {}, JSON.stringify(actionWithId));
        }
    };
    
    

    usePlayerInput(handlePlayerAction);

    return (
        <div>
            <p>Controla al jugador con las teclas de w, a, s, d. Presiona Espacio para disparar.</p>
            {playerPosition && playerDirection && (
                <Tank x={playerPosition.x} y={playerPosition.y} direction={playerDirection} />
            )}
            {console.log('Renderizando tanque en posición:', playerPosition, 'con dirección:', playerDirection)}
        </div>
    );
}
