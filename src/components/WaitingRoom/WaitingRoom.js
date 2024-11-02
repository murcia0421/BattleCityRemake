import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import './WaitingRoom.css';

const WaitingRoom = ({ onJoin, onStartGame }) => {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const stompClient = new Client({
      brokerURL: 'http://localhost:8080/battle-city-websocket', 
      onConnect: () => {
          console.log('Conectado a STOMP');
          setIsConnected(true);
          stompClient.subscribe('/topic/players', (message) => {
              const updatedPlayers = JSON.parse(message.body);
              setPlayers(updatedPlayers);
          });
      },
      onDisconnect: () => {
          console.log('Desconectado de STOMP');
          setIsConnected(false);
      },
      debug: (str) => {
          console.log(str);
      },
  });

  const joinRoom = () => {
    if (name) {
      if (isConnected) {
        stompClient.publish({
          destination: '/app/join',
          body: JSON.stringify({ name }),
        });
        onJoin(name);
      } else {
        console.error("El cliente STOMP no está conectado.");
        alert("Por favor, espera a que la conexión se establezca.");
      }
    } else {
      alert("Por favor, ingresa un nombre.");
    }
  };

  useEffect(() => {
    if (!stompClient.active) {
      stompClient.activate();
    }
    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, []);

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
        <button onClick={joinRoom}>Unirse a la sala de espera</button>
        <h3>Jugadores en la sala:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
        <button onClick={onStartGame}>Iniciar Juego</button> {/* Siempre visible */}
      </div>
    </div>
  );
};

export default WaitingRoom;
