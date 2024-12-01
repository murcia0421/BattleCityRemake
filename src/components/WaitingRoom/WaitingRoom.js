import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';

const WaitingRoom = ({ playerName, onStartGame }) => {
    const [stompClient, setStompClient] = useState(null);
    const [players, setPlayers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [hasJoined, setHasJoined] = useState(false);
    const [myPlayerId, setMyPlayerId] = useState(null);
    const [playerNameInput, setPlayerNameInput] = useState('');

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
                                
                                // Limitar a 4 jugadores
                                if (data.length > 4) {
                                    return;
                                }

                                if (Array.isArray(data)) {
                                    setPlayers(data);
                                    return;
                                }

                                setPlayers(current => {
                                    // No más de 4 jugadores
                                    if (current.length >= 4 && !current.find(p => p.id === data.id)) {
                                        return current;
                                    }

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
        // Validar nombre y límite de jugadores
        if (!playerNameInput.trim()) {
            alert('Por favor, ingresa un nombre');
            return;
        }

        if (players.length >= 4) {
            alert('La sala está llena. No se pueden agregar más jugadores.');
            return;
        }

        if (!stompClient || !stompClient.connected) {
            console.error('No hay conexión con el servidor');
            return;
        }
        
        const playerData = {
            id: null,
            name: playerNameInput.trim(),
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

    const startGame = () => {
        // Validar que haya al menos 2 jugadores
        if (players.length < 2) {
            alert('Se necesitan al menos 2 jugadores para iniciar el juego');
            return;
        }

        if (onStartGame) {
            onStartGame();
        }
    };

    return (
        <div>
            <h2>Battle City Remake</h2>
            <p>Sala de Espera</p>
            <p>Estado: {connectionStatus}</p>
            
            {/* Input para nombre de jugador */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '20px' 
            }}>
                <input 
                    type="text" 
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    style={{ 
                        padding: '10px', 
                        marginRight: '10px',
                        width: '200px'
                    }}
                />
                <button 
                    onClick={addPlayer} 
                    style={{ 
                        backgroundColor: '#4CAF50', 
                        color: 'white',
                        padding: '10px 20px'
                    }}
                    disabled={players.length >= 4}
                >
                    Unirse
                </button>
            </div>

            <p>Total de jugadores: {players.length}/4</p>
            <div>
                <h3>Jugadores en sala:</h3>
                {players.length === 0 ? (
                    <p>No hay jugadores en la sala</p>
                ) : (
                    <ul>
                        {players.map((player, index) => (
                            <li key={player.id || index}>
                                {player.name} {player.id === myPlayerId ? '(Tú)' : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <button 
                onClick={startGame} 
                style={{ 
                    backgroundColor: players.length < 2 ? '#cccccc' : '#4CAF50',
                    color: 'white',
                    padding: '10px 20px',
                    marginTop: '10px'
                }}
                disabled={players.length < 2}
            >
                Comenzar Juego
            </button>
        </div>
    );
};

export default WaitingRoom;