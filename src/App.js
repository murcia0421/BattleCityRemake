import React, { useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard/GameBoard';
import StartScreen from './components/StartScreen/StartScreen';
import TankColorSelector from './components/TankColorSelector/TankColorSelector';
import WaitingRoom from './components/WaitingRoom/WaitingRoom';
import RoomSelector from './components/RoomSelector/RoomSelector'; // Importar RoomSelector
import RoomSelection from './components/RoomSelection/RoomSelection'; // Importamos el nuevo componente
import { useMsal } from "@azure/msal-react";

function App() {
    const { instance, accounts } = useMsal();
    const [currentScreen, setCurrentScreen] = useState('start');
    const [tankColor, setTankColor] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState(null); // Nuevo estado para almacenar el ID de la sala
    const [selectedRoom, setSelectedRoom] = useState(null); // Estado para la sala seleccionada

    const login = () => {
        instance.loginPopup({
          scopes: ["user.read"],
        }).catch((error) => console.error(error));
    };
    
    const logout = () => {
    const logout = () => {
        instance.logoutPopup();
    };
    };

    const handleStart = () => {
        setCurrentScreen('roomSelection'); // Cambia a la pantalla de selección de sala
    };

    const handleRoomSelect = (id) => {
        setRoomId(id);
        setCurrentScreen('colorSelection'); // Después de seleccionar la sala, pasa a selección de color
    };

    const handleColorSelect = (color) => {
        console.log(`Color seleccionado: ${color}`);
        setTankColor(color);
        setCurrentScreen('roomSelection'); // Cambiar a selección de sala
    };

    const handleJoin = (name) => {
        setPlayerName(name);
        setCurrentScreen('waitingRoom');
    };

    const handleRoomSelect = (roomId) => {
        console.log(`Seleccionada la sala: ${roomId}`);
        setSelectedRoom(roomId);
        setCurrentScreen('waitingRoom'); // Después de seleccionar la sala, pasa a la sala de espera
    };

    const handleStartGame = () => {
        setCurrentScreen('gameBoard');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'start':
                return <StartScreen onStart={handleStart} />;
            case 'roomSelection':
                return <RoomSelector onRoomSelect={handleRoomSelect} />; // Nueva pantalla de selección de sala
            case 'colorSelection':
                return <TankColorSelector onColorSelect={handleColorSelect} />;
            case 'roomSelection':
                return <RoomSelection onRoomSelect={handleRoomSelect} />;
            case 'waitingRoom':
                return <WaitingRoom onJoin={handleJoin} playerName={playerName} roomId={roomId} onStartGame={handleStartGame} />; // Pasar roomId a WaitingRoom
                return <WaitingRoom onJoin={handleJoin} playerName={playerName} selectedRoom={selectedRoom} onStartGame={handleStartGame} />;
            case 'gameBoard':
                return <GameBoard tankColor={tankColor} playerName={playerName} selectedRoom={selectedRoom} />;
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
                    <button onClick={logout}>Logout</button>
                    {renderScreen()}
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <button onClick={login}>Login</button>
            )}
        </div>
    );
}

export default App;

