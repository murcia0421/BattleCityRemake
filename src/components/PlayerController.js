import React, { useState, useEffect } from 'react';
import Tank from './Tank';
import usePlayerInput from '../hooks/usePlayerInput';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default function PlayerController() {
    const [playerPosition, setPlayerPosition] = useState({ x: 5, y: 5 });
    const [playerDirection, setPlayerDirection] = useState('up');
    const [stompClient, setStompClient] = useState(null);

    // Inicializar la conexión WebSocket al montar el componente
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/battle-city-websocket');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            client.subscribe('/topic/game-updates', (message) => {
                const updatedState = JSON.parse(message.body);
                // Actualizar la posición y dirección del tanque según el estado recibido del servidor
                setPlayerPosition(updatedState.position);
                setPlayerDirection(updatedState.direction);
            });
        });

        setStompClient(client);

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, []);

    const handlePlayerAction = (action) => {
        if (stompClient && stompClient.connected) {
            stompClient.send('/app/player-action', {}, JSON.stringify(action));
        }
    };

    // El hook captura la entrada del jugador y dispara acciones
    usePlayerInput(handlePlayerAction);

    return (
        <div>
            <p>Controla al jugador con las teclas de flechas. Presiona Espacio para disparar.</p>
            <Tank x={playerPosition.x} y={playerPosition.y} direction={playerDirection} />
        </div>
    );
}
