import React, { useState } from 'react';
import './App.css';
import StartScreen from './components/StartScreen';
import TankColorSelector from './components/TankColorSelector';
import WaitingRoom from './components/WaitingRoom';
import GameBoard from './components/GameBoard';

function App() {
  const [currentScreen, setCurrentScreen] = useState('start');

  const handleStart = () => {
    setCurrentScreen('colorSelection');
  };

  const handleColorSelect = (color) => {
    console.log(`Color seleccionado: ${color}`);
    setCurrentScreen('gameBoard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartScreen onStart={handleStart} />;
      case 'colorSelection':
        return <TankColorSelector onColorSelect={handleColorSelect} />;
      case 'gameBoard':
        return <GameBoard />;
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
