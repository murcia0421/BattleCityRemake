import React, { useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard/GameBoard';
import StartScreen from './components/StartScreen/StartScreen';
import TankColorSelector from './components/TankColorSelector/TankColorSelector';
import WaitingRoom from './components/WaitingRoom/WaitingRoom';

function App() {
    const [currentScreen, setCurrentScreen] = useState('start');
    const [tankColor, setTankColor] = useState(null);
    const [playerName, setPlayerName] = useState('');

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

    const handleStartGame = () => {
        setCurrentScreen('gameBoard');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'start':
                return <StartScreen onStart={handleStart} />;
            case 'colorSelection':
                return <TankColorSelector onColorSelect={handleColorSelect} />;
            case 'waitingRoom':
                return <WaitingRoom onJoin={handleJoin} playerName={playerName} onStartGame={handleStartGame} />;
            case 'gameBoard':
                return <GameBoard tankColor={tankColor} playerName={playerName} />;
            default:
                return <StartScreen onStart={handleStart} />;
        }
    };

    return (
        <div className="App">
            <h1>Battle City Remake</h1>
            {renderScreen()}
        </div>
    );
}

export default App;