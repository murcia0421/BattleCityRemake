import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import './WaitingRoom.css';

const WaitingRoom = ({ onJoin, onStartGame }) => {
  const [name, setName] = useState(''); // Nombre del jugador
  const [players, setPlayers] = useState([]); // Lista de jugadores en la sala
  const [isConnected, setIsConnected] = useState(false); // Estado de la conexión STOMP

  // Crear una instancia del cliente STOMP
  const stompClient = new Client({
    brokerURL: 'ws://localhost:3001/battle-city-websocket', // URL del servidor STOMP
    onConnect: () => {
      console.log('Conectado a STOMP'); 
      setIsConnected(true); // Marca la conexión como activa
      
      // Suscribirse al tópico donde se reciben los jugadores conectados
      stompClient.subscribe('/topic/players', (message) => { 
        const updatedPlayers = JSON.parse(message.body); // Parsear los jugadores recibidos
        setPlayers(updatedPlayers); // Actualizar la lista de jugadores
      });
    },
    onDisconnect: () => {
      console.log('Desconectado de STOMP');
      setIsConnected(false); // Marcar la desconexión
    },
    debug: (str) => {
      console.log(str); // Imprimir mensajes de debug
    },
  });

  // Función para unirse a la sala de espera
  const joinRoom = () => {
    if (name) {
      if (isConnected) {
        // Publicar un mensaje en el servidor STOMP para unirse
        stompClient.publish({
          destination: '/app/join', // El endpoint en el servidor
          body: JSON.stringify({ name }), // Enviar el nombre del jugador
        });
        onJoin(name); // Llamar la función onJoin para actualizar el estado del jugador en el frontend
      } else {
        console.error("El cliente STOMP no está conectado.");
        alert("Por favor, espera a que la conexión se establezca.");
      }
    } else {
      alert("Por favor, ingresa un nombre.");
    }
  };

  // Usar useEffect para activar y desactivar la conexión STOMP
  useEffect(() => {
    stompClient.activate(); // Activar la conexión STOMP cuando el componente se monta
    return () => stompClient.deactivate(); // Desactivar la conexión cuando el componente se desmonta
  }, []);

  return (
    <div className="waiting-room">
      <div className="waiting-room-box">
        <h2>Bienvenido a la sala de espera</h2>
        
        {/* Input para ingresar el nombre */}
        <input
          type="text"
          placeholder="Ingresa tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        {/* Botón para unirse a la sala */}
        <button onClick={joinRoom}>Unirse a la sala de espera</button>
        
        <h3>Jugadores en la sala:</h3>
        <ul>
          {/* Mostrar la lista de jugadores conectados */}
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
        
        {/* Botón para iniciar el juego, siempre visible */}
        <button onClick={onStartGame}>Iniciar Juego</button>
      </div>
    </div>
  );
};

export default WaitingRoom;
