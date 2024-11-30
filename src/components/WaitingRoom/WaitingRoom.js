import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WaitingRoom = ({ onJoin, playerName, onStartGame }) => {
    const [stompClient, setStompClient] = useState(null);
    const [players, setPlayers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [hasJoined, setHasJoined] = useState(false);
    const [myPlayerId, setMyPlayerId] = useState(null);

    useEffect(() => {
        const connectToWebSocket = () => {
            try {
                const socket = new SockJS('http://localhost:8080/ws');
                const client = new Client({
                    webSocketFactory: () => socket,
                    reconnectDelay: 5000,
                    debug: (str) => {
                        console.log('STOMP Debug:', str);
                    },
                    onConnect: () => {
                        console.log('Conectado al servidor');
                        setConnectionStatus('connected');
                        
                        client.subscribe('/topic/players', (message) => {
                            console.log('Mensaje recibido del servidor:', message.body);
                            try {
                                const data = JSON.parse(message.body);
                                
                                if (Array.isArray(data)) {
                                    setPlayers(data);
                                    // Verificar si este cliente ya está en la lista
                                    const isAlreadyJoined = data.some(player => player.id === myPlayerId);
                                    setHasJoined(isAlreadyJoined);
                                    return;
                                }

                                setPlayers(current => {
                                    // Evitar duplicados
                                    const existingPlayer = current.find(p => p.id === data.id);
                                    if (existingPlayer) {
                                        return current.map(p => p.id === data.id ? data : p);
                                    }
                                    return [...current, data];
                                });

                                // Si este es nuestro nuevo jugador
                                if (!hasJoined && data.id) {
                                    setMyPlayerId(data.id);
                                    setHasJoined(true);
                                }
                            } catch (e) {
                                console.error('Error al procesar mensaje:', e);
                            }
                        });

                        client.publish({
                            destination: '/app/request-players'
                        });
                    },
                    onStompError: (frame) => {
                        console.error('Error en STOMP:', frame.headers['message']);
                        setConnectionStatus('error');
                    },
                    onDisconnect: () => {
                        console.log('Desconectado del servidor');
                        setConnectionStatus('disconnected');
                        setHasJoined(false);
                        setMyPlayerId(null);
                    }
                });

                client.activate();
                setStompClient(client);

                return client;
            } catch (error) {
                console.error('Error al conectar:', error);
                setConnectionStatus('error');
            }
        };

        const client = connectToWebSocket();

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [myPlayerId, hasJoined]);

    const addPlayer = () => {
        if (!stompClient || !stompClient.connected) {
            console.error('No hay conexión con el servidor');
            return;
        }

        if (hasJoined || players.length >= 4) {
            console.log('No puedes unirte: Ya estás unido o la sala está llena');
            return;
        }

        console.log('Intentando añadir jugador...'); 
        
        const playerData = {
            id: null,
            position: null,
            direction: "down"
        };

        try {
            stompClient.publish({
                destination: '/app/players',
                body: JSON.stringify(playerData)
            });
            console.log('Mensaje enviado al servidor');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    };

    const canStartGame = players.length >= 2
    console.log(canStartGame);
    console.log(players.length);


    return (
        <div>
            <h2>Battle City Remake</h2>
            <p>Sala de Espera</p>
            <p>Estado: {connectionStatus}</p>
            <p>Jugador: {playerName || 'Sin nombre'}</p>
            <p>Total de jugadores: {players.length}/4</p>
            <div>
                <h3>Jugadores en sala:</h3>
                {players.length === 0 ? (
                    <p>No hay jugadores en la sala</p>
                ) : (
                    <ul>
                        {players.map((player, index) => (
                            <li key={player.id || index}>
                                {player.id} {player.id === myPlayerId ? '(Tú)' : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button 
                onClick={addPlayer} 
                disabled={hasJoined || players.length >= 4}
                style={{ backgroundColor: hasJoined ? '#cccccc' : '#4CAF50' }}
            >
                {hasJoined ? 'Ya unido' : 'Unirse'}
            </button>
            <button 
                onClick={onStartGame} 
                disabled={!canStartGame}
                style={{ 
                    backgroundColor: canStartGame ? '#4CAF50' : '#cccccc',
                    marginLeft: '10px'
                }}
            >
                Comenzar Juego ({players.length}/2 necesarios)
            </button>
            <p style={{ fontSize: '0.8em', color: '#666' }}>
                {!hasJoined ? 'Debes unirte para poder comenzar' : 
                 players.length < 2 ? 'Se necesitan al menos 2 jugadores para comenzar' : 
                 canStartGame ? 'Puedes comenzar el juego' : ''}
            </p>
        </div>
    );
};

export default WaitingRoom;