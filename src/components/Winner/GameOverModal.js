import React from 'react';
import './GameOverModal.css';

const GameOverModal = ({ winner, onRestart }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>¡Fin del Juego!</h2>
        <p>¡{winner} ha ganado la partida!</p>
        <button onClick={onRestart} className="restart-button">
          Jugar de nuevo
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
