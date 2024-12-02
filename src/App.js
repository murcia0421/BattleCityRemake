
import { useMsal } from "@azure/msal-react";
import React, { useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard/GameBoard';
import StartScreen from './components/StartScreen/StartScreen';
import TankColorSelector from './components/TankColorSelector/TankColorSelector';
import WaitingRoom from './components/WaitingRoom/WaitingRoom';

function App() {
    const { instance, accounts } = useMsal();
    const [currentScreen, setCurrentScreen] = useState('start');
    const [tankColor, setTankColor] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [gamePlayers, setGamePlayers] = useState([]); // Nuevo estado para los jugadores

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
        setCurrentScreen('waitingRoom');
    };

    const handleJoin = (name) => {
        setPlayerName(name);
        setCurrentScreen('waitingRoom');
    };

    const handleStartGame = (playersOrPlayer) => {
        console.log('Iniciando juego:', playersOrPlayer);
    
        const players = Array.isArray(playersOrPlayer)
            ? playersOrPlayer
            : [playersOrPlayer];
    
        setGamePlayers(players);
        setCurrentScreen('gameBoard');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'start':
                return <StartScreen onStart={handleStart} />;
            case 'colorSelection':
                return <TankColorSelector onColorSelect={handleColorSelect} />;
            case 'waitingRoom':
                return (
                    <WaitingRoom
                        onJoin={handleJoin}
                        playerName={playerName}
                        onStartGame={handleStartGame}
                    />
                );
            case 'gameBoard':
                return (
                    <GameBoard
                        tankColor={tankColor}
                        playersData={gamePlayers} // Pasamos los jugadores guardados
                    />
                );
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
                    <button onClick={logout} className="auth-button">
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={login} className="auth-button">
                    Login
                </button>
            )}
        </div>
    );
}

export default App;
