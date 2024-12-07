import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Map from '../Map/map';
import mapData from '../Map/MapData';

const GameBoard = ({ playersData, roomId, onRestart }) => {  // Añadimos roomId aquí
  const [players, setPlayers] = useState(playersData || []);

  useEffect(() => {
    if (playersData) {
      setPlayers(playersData);
      console.log('Jugadores inicializados:', playersData);
    }
  }, [playersData]);

  return (
    <div className="game-board">
      <Map
        players={players}
        mapData={mapData}
        roomId={roomId}  // Pasamos roomId a Map
        onRestart={onRestart}
      />
    </div>
  );
};

GameBoard.propTypes = {
  playersData: PropTypes.array.isRequired,
  roomId: PropTypes.string.isRequired,  // Añadimos la validación de prop
};

export default GameBoard;