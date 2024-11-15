// src/components/RoomSelector/RoomSelector.js

import React from 'react';

function RoomSelector({ onRoomSelect }) {
    return (
        <div>
            <h2>Selecciona una Sala</h2>
            <div>
                <button onClick={() => onRoomSelect(1)}>Sala 1</button>
                <button onClick={() => onRoomSelect(2)}>Sala 2</button>
                <button onClick={() => onRoomSelect(3)}>Sala 3</button>
                <button onClick={() => onRoomSelect(4)}>Sala 4</button>
            </div>
        </div>
    );
}

export default RoomSelector;
