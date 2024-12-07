import React from 'react';
import './RoomSelector.css';

const RoomSelector = ({ onRoomSelect }) => {
  const rooms = [
    { id: 'room1', name: 'Sala 1' },
    { id: 'room2', name: 'Sala 2' },
    { id: 'room3', name: 'Sala 3' },
    { id: 'room4', name: 'Sala 4' }
  ];

  return (
    <div className="room-selector">
      <h2>Selecciona una Sala</h2>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <button
            key={room.id}
            className="room-button"
            onClick={() => onRoomSelect(room.id)}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;