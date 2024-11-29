import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import './WaitingRoom.css';

const WaitingRoom = ({ onJoin, onStartGame }) => {
    const [name, setName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([
        { id: 'room1', name: 'Room 1', currentPlayers: 0, maxPlayers: 4 },
        { id: 'room2', name: 'Room 2', currentPlayers: 0, maxPlayers: 4 },
        { id: 'room3', name: 'Room 3', currentPlayers: 0, maxPlayers: 4 },
        { id: 'room4', name: 'Room 4', currentPlayers: 0, maxPlayers: 4 }
    ]);
    const [isConnected, setIsConnected] = useState(false);

    const stompClient = new Client({
        brokerURL: 'ws://localhost:3001/battle-city-websocket',
        onConnect: () => {
            console.log('Connected to STOMP');
            setIsConnected(true);

            // Suscribirse a actualizaciones
            stompClient.subscribe('/topic/rooms', (message) => {
                const updatedRooms = JSON.parse(message.body);
                setRooms(updatedRooms);
            });
        },
        onDisconnect: () => {
            console.log('Disconnected from STOMP');
            setIsConnected(false);
        },
        debug: (str) => {
            console.log(str);
        },
    });

    const joinRoom = () => {
        if (name && selectedRoom) {
            if (isConnected) {
                // Publish message to join a specific room
                stompClient.publish({
                    destination: '/app/join-room',
                    body: JSON.stringify({
                        name,
                        roomId: selectedRoom
                    }),
                });
                onJoin(name);
            } else {
                alert("Please wait for the connection to be established.");
            }
        } else {
            alert("Please enter a name and select a room.");
        }
    };

    useEffect(() => {
        stompClient.activate();
        return () => stompClient.deactivate();
    }, []);

    return (
        <div className="waiting-room">
            <div className="waiting-room-box">
                <h2>Welcome to the Waiting Room</h2>
                
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                
                <div className="room-selection">
                    <h3>Select a Room:</h3>
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className={`room-option ${selectedRoom === room.id ? 'selected' : ''}`}
                            onClick={() => setSelectedRoom(room.id)}
                        >
                            {room.name} - Players: {room.currentPlayers}/{room.maxPlayers}
                        </div>
                    ))}
                </div>
                
                <button
                    onClick={joinRoom}
                    disabled={!name || !selectedRoom}
                >
                    Join Room
                </button>
                
                <button
                    onClick={onStartGame}
                    //disabled={!selectedRoom}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default WaitingRoom;