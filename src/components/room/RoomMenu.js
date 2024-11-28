import React, { useEffect, useState } from "react";
import { connectToRoom, leaveRoom } from "../../server/server";

const RoomMenu = ({ roomName, onStartGame }) => {
    const [players, setPlayers] = useState(0);

    useEffect(() => {
        const handleMessage = (message) => {
            console.log("Mensaje recibido:", message);
            
            if (message.roomName === roomName) {
                const playerCount = message.currentPlayers;
                console.log(`Actualizando jugadores en sala ${roomName} a: ${playerCount}`);
                setPlayers(playerCount);
            }
        };

        console.log(`Conectando a sala: ${roomName}`);
        connectToRoom(roomName, handleMessage);

        return () => {
            console.log(`Desconectando de sala: ${roomName}`);
            leaveRoom(roomName);
        };
    }, [roomName]);

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4">Room: {roomName}</h2>
            <p className="mb-4">Players Connected: {players}</p>
            <div className="space-y-2 mb-4">
                <button 
                    className="w-full p-2 bg-gray-300 rounded disabled:opacity-50" 
                    disabled
                >
                    Choose Map (Coming Soon)
                </button>
                <button 
                    className="w-full p-2 bg-gray-300 rounded disabled:opacity-50" 
                    disabled
                >
                    Choose Mode (Coming Soon)
                </button>
            </div>
            <button 
                onClick={onStartGame}
                disabled={players < 2}
                className={`w-full p-2 rounded ${
                    players < 2 
                        ? 'bg-gray-300' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
                Start Game {players < 2 ? `(Need ${2 - players} more player${2 - players === 1 ? '' : 's'})` : ''}
            </button>
        </div>
    );
};

export default RoomMenu;