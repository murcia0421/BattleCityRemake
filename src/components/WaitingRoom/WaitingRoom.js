import { Client } from '@stomp/stompjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import './WaitingRoom.css';

// Colores de los tanques disponibles
const TANK_COLORS = ['Azul', 'Verde', 'Morado', 'Amarillo'];

const WaitingRoom = ({ onStartGame, roomId }) => {
    const [stompClient, setStompClient] = useState(null);
    const [players, setPlayers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [hasJoined, setHasJoined] = useState(false);
    const [myPlayerId, setMyPlayerId] = useState(null);
    const [playerNameInput, setPlayerNameInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);

    // Configura la conexión WebSocket al montar el componente
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => console.log('STOMP Debug:', str),
            onConnect: () => handleConnect(client),
            onStompError: (frame) => handleStompError(frame),
            onDisconnect: handleDisconnect,
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client.connected) client.deactivate();
        };
    }, [playerNameInput]);

    const handleConnect = (client) => {
        console.log('Conectado al servidor');
        setConnectionStatus('connected');
    
        client.subscribe(`/topic/room/${roomId}/players`, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log("Datos recibidos del servidor:", data);
                handlePlayerUpdates(data);
            } catch (e) {
                console.error('Error al procesar mensaje:', e);
            }
        });
    
        console.log("Solicitando lista de jugadores para sala:", roomId);
        client.publish({
            destination: `/app/room/${roomId}/request-players`
        });
    };
    
    const handlePlayerUpdates = (data) => {
        console.log("Procesando actualización de jugadores:", data);
        if (Array.isArray(data)) {
            console.log("Recibida lista completa de jugadores:", data);
            const foundPlayer = data.find((p) => p.name === playerNameInput);
            if (foundPlayer) {
                setMyPlayerId(foundPlayer.id);
                setHasJoined(true);
                setSelectedColor(foundPlayer.tankColor);
            }
            setPlayers(data);
        } else {
            console.log("Recibida actualización de un jugador:", data);
            setPlayers((current) => {
                const updatedPlayers = current.findIndex((p) => p.id === data.id) !== -1
                    ? current.map(p => p.id === data.id ? data : p)
                    : [...current, data];
                console.log("Nueva lista de jugadores:", updatedPlayers);
                return updatedPlayers;
            });
    
            if (data.name === playerNameInput) {
                setMyPlayerId(data.id);
                setHasJoined(true);
                setSelectedColor(data.tankColor);
            }
        }
    };

    const handleStompError = (frame) => {
        console.error('Error en STOMP:', frame.headers['message']);
        setConnectionStatus('error');
    };

    const handleDisconnect = () => {
        console.log('Desconectado del servidor');
        setConnectionStatus('disconnected');
        setHasJoined(false);
        setMyPlayerId(null);
        setSelectedColor(null);
    };

    const addPlayer = () => {
        if (!playerNameInput.trim()) {
            alert('Por favor, ingresa un nombre');
            return;
        }
        if (players.length >= 4) {
            alert('La sala está llena');
            return;
        }
        if (hasJoined) {
            alert('Ya te has unido a la sala');
            return;
        }
        if (!stompClient?.connected) {
            alert('No hay conexión con el servidor');
            return;
        }
        if (players.some((p) => p.name === playerNameInput.trim())) {
            alert('Este nombre ya está en uso');
            return;
        }
        if (!selectedColor) {
            alert('Por favor, selecciona un color de tanque');
            return;
        }

        const playerData = {
            id: `Jugador ${players.length + 1}`,
            name: playerNameInput.trim(),
            position: null,
            direction: 'down',
            lives: 3,
            isAlive: true,
            tankColor: selectedColor,
        };

        console.log('Enviando jugador:', playerData);

        try {
            stompClient.publish({
                destination: `/app/room/${roomId}/players`,
                body: JSON.stringify(playerData),
            });
        } catch (error) {
            console.error('Error al enviar jugador:', error);
        }
    };

    const handleColorSelect = (color) => {
        if (players.some((player) => player.tankColor === color)) {
            alert('Este color ya está seleccionado');
            return;
        }
        setSelectedColor(color);
    };

    const startGame = () => {
        if (players.length < 2) {
            alert('Se necesitan al menos 2 jugadores');
            return;
        }

        const myPlayer = players.find((player) => player.id === myPlayerId);
        if (!myPlayer) {
            console.error('No se encontró al jugador actual en la lista');
            return;
        }

        const myIndex = players.indexOf(myPlayer);
        const predefinedPositions = [
            { x: 1, y: 1 },
            { x: 2, y: 9 },
            { x: 5, y: 5 },
            { x: 8, y: 3 },
        ];
        const myPosition = predefinedPositions[myIndex] || { x: 0, y: 0 };

        const myUpdatedPlayer = {
            ...myPlayer,
            position: myPosition,
        };

        console.log('Iniciando juego con mi jugador:', myUpdatedPlayer);
        onStartGame(myUpdatedPlayer);
    };

    return (
        <div className="waiting-room-container">
            <div className="waiting-room-box">
                <h2 className="waiting-room-title">Battle City Remake</h2>
                <p className="waiting-room-subtitle">Sala de Espera</p>
                <p className="connection-status">Estado: {connectionStatus}</p>

                <div className="player-input-container">
                    <input
                        type="text"
                        value={playerNameInput}
                        onChange={(e) => setPlayerNameInput(e.target.value)}
                        placeholder="Ingresa tu nombre"
                        className="player-input"
                        disabled={hasJoined}
                    />
                    <div className="color-selector">
                        {TANK_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                disabled={hasJoined || players.some((p) => p.tankColor === color)}
                                className={`color-button ${color} ${selectedColor === color ? 'selected' : ''}`}
                                style={{ opacity: players.some((p) => p.tankColor === color) ? 0.5 : 1 }}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={addPlayer}
                        className="add-player-button"
                        disabled={hasJoined || players.length >= 4 || !selectedColor}
                    >
                        {hasJoined ? 'Ya unido' : 'Unirse'}
                    </button>
                </div>

                <p>Jugadores: {players.length}/4</p>
                <div>
                    <h3>Jugadores en sala:</h3>
                    <ul className="players-list">
                        {players.length === 0 ? (
                            <li>No hay jugadores</li>
                        ) : (
                            players.map((player) => (
                                <li key={player.id} className="player-item">
                                    {player.name} {player.id === myPlayerId ? '(Tú)' : ''} - 
                                    <span className={`color-indicator ${player.tankColor}`}>
                                        {player.tankColor}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <button
                    onClick={startGame}
                    className="start-game-button"
                    disabled={players.length < 2}
                >
                    Comenzar Juego ({players.length}/2 necesarios)
                </button>
            </div>
        </div>
    );
};

// Validación de props
WaitingRoom.propTypes = {
    onStartGame: PropTypes.func.isRequired,
};

export default WaitingRoom;
