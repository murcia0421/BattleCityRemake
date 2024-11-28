import { useMsal } from "@azure/msal-react";
import React, { useEffect, useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard/GameBoard';
import RoomMenu from './components/room/RoomMenu';
import RoomSelector from './components/room/RoomSelector';
import StartScreen from './components/StartScreen/StartScreen';
import TankColorSelector from './components/TankColorSelector/TankColorSelector';
import { connectToRoom, leaveRoom } from './websocket/WebSocketClient';

function App() {
    const { instance, accounts } = useMsal();
    const [currentScreen, setCurrentScreen] = useState('start');
    const [tankColor, setTankColor] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [players, setPlayers] = useState(0);

    useEffect(() => {
        if (selectedRoom) {
            // Conectar al WebSocket cuando se selecciona una sala
            connectToRoom(selectedRoom, handleMessageReceived);
        }
        return () => {
            if (selectedRoom) {
                leaveRoom(selectedRoom); // Salir de la sala cuando el componente se desmonta
            }
        };
    }, [selectedRoom]);

    const login = () => {
        instance.loginPopup({
          scopes: ["user.read"],
        }).then(() => {
            // Redirigir directamente al juego después de un login exitoso
            setCurrentScreen('gameBoard');
        }).catch((error) => console.error(error));
    };

    const handleStart = () => {
        setCurrentScreen('colorSelection');
    };

    const handleColorSelect = (color) => {
        setTankColor(color);
        setCurrentScreen('roomSelector');
    };

    const handleRoomJoin = (roomName) => {
        setSelectedRoom(roomName);
        setPlayers(1); // Simula un jugador conectado
        setCurrentScreen('roomMenu');
    };

    const handleStartGame = () => {
        setCurrentScreen('gameBoard');
    };

    const handleMessageReceived = (message) => {
        // Aquí se maneja el mensaje recibido desde el WebSocket
        if (message.action === 'PLAYER_JOIN') {
            setPlayers(prev => prev + 1);  // Incrementar el contador de jugadores
        }
        console.log("Received message: ", message);
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'start':
                return <StartScreen onStart={handleStart} />;
            case 'colorSelection':
                return <TankColorSelector onColorSelect={handleColorSelect} />;
            case 'roomSelector':
                return <RoomSelector onRoomJoin={handleRoomJoin} />;
            case 'roomMenu':
                return (
                    <RoomMenu 
                        roomName={selectedRoom} 
                        players={players} 
                        onStartGame={handleStartGame} 
                    />
                );
            case 'gameBoard':
                return <GameBoard tankColor={tankColor} playerName={playerName} />;
            default:
                return <StartScreen onStart={handleStart} />;
        }
    };

    return (
        <div className="App">
            <h1>Battle City Remake</h1>
            {accounts.length > 0 ? (
                <div>
                    {renderScreen()}
                    {/* Eliminado el botón de logout, ya no es necesario */}
                </div>
            ) : (
                <button onClick={login}>Login</button>
            )}
        </div>
    );
}

export default App;
