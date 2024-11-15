import React, { useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard/GameBoard';
import StartScreen from './components/StartScreen/StartScreen';
import TankColorSelector from './components/TankColorSelector/TankColorSelector';
import WaitingRoom from './components/WaitingRoom/WaitingRoom';
import RoomSelection from './components/RoomSelection/RoomSelection'; // Importamos el nuevo componente
import { useMsal } from "@azure/msal-react";

function App() {
    const { instance, accounts } = useMsal();
    const [currentScreen, setCurrentScreen] = useState('start');
    const [tankColor, setTankColor] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null); // Estado para la sala seleccionada

    const login = () => {
        instance.loginPopup({
          scopes: ["user.read"],
        }).catch((error) => console.error(error));
    };
    
    const logout = () => {
        instance.logoutPopup();
    };

    const handleStart = () => {
        setCurrentScreen('colorSelection');
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
            case 'colorSelection':
                return <TankColorSelector onColorSelect={handleColorSelect} />;
            case 'roomSelection':
                return <RoomSelection onRoomSelect={handleRoomSelect} />;
            case 'waitingRoom':
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
                </div>
            ) : ( 
                <button onClick={login}>Login</button>
            )}
        </div>
    );
}

export default App;
