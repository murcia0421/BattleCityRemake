import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
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
                                    return;
                                }

                                setPlayers(current => {
                                    const existingPlayer = current.find(p => p.id === data.id);
                                    if (existingPlayer) {
                                        return current.map(p => p.id === data.id ? data : p);
                                    }
                                    return [...current, data];
                                });

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

    const startGameWithoutPlayers = () => {
        console.log('Iniciando el juego sin jugadores...');
        if (onStartGame) {
            onStartGame();
        }
    };

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
                style={{ backgroundColor: '#4CAF50' }}
            >
                Unirse
            </button>
            <button 
                onClick={onStartGame} 
                style={{ 
                    backgroundColor: '#4CAF50',
                    marginLeft: '10px'
                }}
            >
                Comenzar Juego
            </button>
            <button
                onClick={startGameWithoutPlayers}
                style={{
                    backgroundColor: '#f44336',
                    marginLeft: '10px',
                    color: '#fff'
                }}
            >
                Forzar Inicio
            </button>
        </div>
    );
};

export default WaitingRoom;
