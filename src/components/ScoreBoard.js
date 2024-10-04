import React from 'react';
import { useSelector } from 'react-redux';

const ScoreBoard = () => {
    const players = useSelector((state) => state.game.players);

    return (
        <div className="score-board">
            <h2>Score Board</h2>
            <ul>
                {players.map((player) => (
                    <li key={player.id}>{player.name}: {player.score}</li>
                ))}
            </ul>
        </div>
    );
};

export default ScoreBoard;
