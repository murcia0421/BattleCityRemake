import { useMsal } from "@azure/msal-react";
import React, { useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard/GameBoard';
import WaitingRoom from './components/WaitingRoom/WaitingRoom';

function App() {
    const { instance, accounts } = useMsal();
    const [currentScreen, setCurrentScreen] = useState('waitingRoom');
    const [gamePlayers, setGamePlayers] = useState([]);

    const login = () => {
        instance.loginPopup({
            scopes: ["user.read"],
        }).catch((error) => console.error(error));
    };

    const logout = () => {
        instance.logoutPopup();
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
            case 'waitingRoom':
                return (
                    <WaitingRoom
                        onStartGame={handleStartGame}
                    />
                );
            case 'gameBoard':
                return (
                    <GameBoard
                        playersData={gamePlayers}
                    />
                );
            default:
                return <WaitingRoom onStartGame={handleStartGame} />;
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