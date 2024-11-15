import { Client } from '@stomp/stompjs';
import React, { useEffect, useState, useMemo } from 'react';
import './WaitingRoom.css';

const WaitingRoom = ({ onJoin, onStartGame, selectedRoom }) => {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // Memorizar la creación de stompClient para que no se recree en cada renderizado
  const stompClient = useMemo(() => new Client({
    brokerURL: 'ws://localhost:8080/battle-city-websocket',
    onConnect: () => {
      console.log('Conectado a STOMP');
      setIsConnected(true);
      setIsConnecting(false);
      stompClient.subscribe(`/topic/players/${selectedRoom}`, (message) => {
        const updatedPlayers = JSON.parse(message.body);
        setPlayers(updatedPlayers);
      });
    },
    onDisconnect: () => {
      console.log('Desconectado de STOMP');
      setIsConnected(false);
      setIsConnecting(false);
    },
    debug: (str) => {
      console.log(str);
    },
  }), [selectedRoom]); // Solo se recrea cuando selectedRoom cambia

  const joinRoom = () => {
    if (name) {
      if (isConnected) {
        stompClient.publish({
          destination: '/app/join',
          body: JSON.stringify({ name, roomId: selectedRoom }), // Enviamos el roomId
        });
        onJoin(name);
      } else if (isConnecting) {
        console.error('El cliente STOMP aún está en proceso de conexión.');
        alert('Por favor, espera a que la conexión se establezca.');
      } else {
        console.error('El cliente STOMP no está conectado.');
        alert('Hubo un error al intentar conectarse. Intenta nuevamente.');
      }
    } else {
      alert('Por favor, ingresa un nombre.');
    }
  };

  useEffect(() => {
    stompClient.activate(); // Activamos la conexión STOMP al montar el componente
    return () => stompClient.deactivate(); // Desactivamos la conexión al desmontar el componente
  }, [stompClient]); // Solo depende de stompClient

  return (
    <div className="waiting-room">
      <div className="waiting-room-box">
        <h2>Bienvenido a la sala de espera</h2>
        <input
          type="text"
          placeholder="Ingresa tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={joinRoom} disabled={isConnecting}>Unirse a la sala de espera</button>
        <h3>Jugadores en la sala:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
        {players.length >= 2 && (
          <button onClick={onStartGame}>Iniciar Juego</button>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
