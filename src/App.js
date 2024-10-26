import React, { useState } from 'react';
import './App.css';
import StartScreen from './components/StartScreen/StartScreen';
import TankColorSelector from './components/TankColorSelector/TankColorSelector';
import GameBoard from './components/GameBoard/GameBoard';

function App() {
  const [currentScreen, setCurrentScreen] = useState('start');
  const [tankColor, setTankColor] = useState(null); // Almacenar el color del tanque seleccionado

  const handleStart = () => {
    setCurrentScreen('colorSelection');
  };

  const handleColorSelect = (color) => {
    console.log(`Color seleccionado: ${color}`);
    setTankColor(color); // Guardar el color seleccionado
    setCurrentScreen('gameBoard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartScreen onStart={handleStart} />;
      case 'colorSelection':
        return <TankColorSelector onColorSelect={handleColorSelect} />;
      case 'gameBoard':
        return <GameBoard tankColor={tankColor} />; // Pasar el color del tanque a GameBoard
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
