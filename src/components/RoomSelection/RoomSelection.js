// src/components/RoomSelection/RoomSelection.js
import React from 'react';

function RoomSelection({ onRoomSelect }) {
    const availableRooms = [
        { id: 'room1', name: 'Sala 1 (2 jugadores)' },
        { id: 'room2', name: 'Sala 2 (2 jugadores)' },
        { id: 'room3', name: 'Sala 3 (4 jugadores)' },
        { id: 'room4', name: 'Sala 4 (4 jugadores)' },
    ];

    return (
        <div>
            <h2>Selecciona una sala</h2>
            <ul>
                {availableRooms.map(room => (
                    <li key={room.id}>
                        <button onClick={() => onRoomSelect(room.id)}>{room.name}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RoomSelection;
