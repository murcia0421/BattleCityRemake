import React, { useEffect, useState } from "react";
import { connectToRoom, leaveRoom } from "../../server/server";


const RoomSelector = ({ onRoomJoin }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        return () => {
            if (selectedRoom) {
                handleLeaveRoom();
            }
        };
    }, []);

    const handleJoinRoom = (room) => {
        setSelectedRoom(room);
        onRoomJoin(room);
        connectToRoom(room, (message) => {
            console.log("Received message:", message);
            setMessages((prev) => [...prev, message]);
        });
    };

    const handleLeaveRoom = () => {
        if (selectedRoom) {
            leaveRoom(selectedRoom);
            setSelectedRoom(null);
            setMessages([]);
            onRoomJoin(null);
        }
    };

    return (
        <div>
            <h1>Room Selector</h1>
            <div>
                {["room1", "room2", "room3", "room4"].map((room) => (
                    <button
                        key={room}
                        onClick={() => handleJoinRoom(room)}
                        disabled={selectedRoom === room}
                    >
                        Join {room}
                    </button>
                ))}
            </div>
            
            {selectedRoom && (
                <button onClick={handleLeaveRoom}>
                    Leave {selectedRoom}
                </button>
            )}
            
            <div>
                <h2>Messages</h2>
                <div>
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <pre>
                                {JSON.stringify(msg, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomSelector;