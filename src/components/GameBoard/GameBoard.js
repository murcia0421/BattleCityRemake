import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Map from '../Map/map';
import mapData from '../Map/MapData';

const GameBoard = ({ tankColor, playersData }) => {
  const [players, setPlayers] = useState(playersData || []); 

  useEffect(() => {
    // Actualizar jugadores cuando cambian en las props
    if (playersData) {
      setPlayers(playersData);
      console.log('Jugadores inicializados:', playersData);
    }
  }, [playersData]);

  return (
    <div className="game-board">
      <Map 
        players={players}
        tankColor={tankColor}
        mapData={mapData}
      />
      {/* Bullet rendering removed as no bullets are tracked */}
    </div>
  );
};

// PropTypes validation for the props
GameBoard.propTypes = {
  tankColor: PropTypes.string.isRequired,  // tankColor should be a string
  playersData: PropTypes.array.isRequired, // playersData should be an array
};

export default GameBoard;
