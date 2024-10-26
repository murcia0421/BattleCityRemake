import React, { useState, useEffect } from 'react';
import './WaitingRoom.css';

const WaitingRoom = ({ requiredPlayers = 2, onStartGame }) => {
  const [players, setPlayers] = useState([]);
  
  useEffect(() => {
    if (players.length === requiredPlayers) {
      onStartGame();
    }
  }, [players, requiredPlayers, onStartGame]);

  const handleAddPlayer = () => {
    const newPlayer = `Jugador ${players.length + 1}`;
    setPlayers([...players, newPlayer]);
  };

  return (
    <div className="waiting-room">
      <h2>Sala de Espera</h2>
      <p>Esperando a que se unan {requiredPlayers} jugadores...</p>
      <ul className="players-list">
        {players.map((player, index) => (
          <li key={index} className="player-item">{player}</li>
        ))}
      </ul>
      <p>{players.length}/{requiredPlayers} jugadores han ingresado.</p>
      {players.length < requiredPlayers && (
        <button onClick={handleAddPlayer} className="add-player-button">
          Unirse a la Sala
        </button>
      )}
    </div>
  );
};

export default WaitingRoom;
