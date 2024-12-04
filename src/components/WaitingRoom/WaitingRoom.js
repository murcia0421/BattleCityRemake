import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { getAllPlayers, createPlayer } from "../../api";
import './WaitingRoom.css';

const WaitingRoom = ({ playerName, onStartGame }) => {
   const [stompClient, setStompClient] = useState(null);
   const [players, setPlayers] = useState([]);
   const [connectionStatus, setConnectionStatus] = useState('disconnected');
   const [hasJoined, setHasJoined] = useState(false);
   const [myPlayerId, setMyPlayerId] = useState(null);
   const [playerNameInput, setPlayerNameInput] = useState('');

   useEffect(() => {
       const socket = new SockJS('http://localhost:8080/ws');
       const client = new Client({
           webSocketFactory: () => socket,
           reconnectDelay: 5000,
           debug: (str) => console.log('STOMP Debug:', str),
           onConnect: () => {
               console.log('Conectado al servidor');
               setConnectionStatus('connected');
               
               client.subscribe('/topic/players', (message) => {
                   try {
                       const data = JSON.parse(message.body);
                       console.log('Datos recibidos:', data);
                       
                       if (Array.isArray(data)) {
                           // Lista completa de jugadores
                           const foundPlayer = data.find(p => p.name === playerNameInput);
                           if (foundPlayer) {
                               setMyPlayerId(foundPlayer.id);
                               setHasJoined(true);
                           }
                           setPlayers(data);
                       } else {
                           // Jugador individual
                           setPlayers(current => {
                               const existingPlayerIndex = current.findIndex(p => p.id === data.id);
                               if (existingPlayerIndex !== -1) {
                                   const newPlayers = [...current];
                                   newPlayers[existingPlayerIndex] = data;
                                   return newPlayers;
                               }
                               return [...current, data];
                           });

                           if (data.name === playerNameInput) {
                               setMyPlayerId(data.id);
                               setHasJoined(true);
                           }
                       }
                   } catch (e) {
                       console.error('Error al procesar mensaje:', e);
                   }
               });

               client.publish({
                   destination: '/app/request-players'
               });
           },
           onStompError: (frame) => {
               console.error('Error en STOMP:', frame.headers['message']);
               setConnectionStatus('error');
           },
           onDisconnect: () => {
               console.log('Desconectado del servidor');
               setConnectionStatus('disconnected');
               setHasJoined(false);
               setMyPlayerId(null);
           }
       });

       client.activate();
       setStompClient(client);

       return () => {
           if (client.connected) {
               client.deactivate();
           }
       };
   }, [playerNameInput]);

   const addPlayer = async () => {
       if (!playerNameInput.trim()) {
           alert('Por favor, ingresa un nombre');
           return;
       }

       if (players.length >= 4) {
           alert('La sala está llena');
           return;
       }

       if (hasJoined) {
           alert('Ya te has unido a la sala');
           return;
       }

       if (!stompClient?.connected) {
           alert('No hay conexión con el servidor');
           return;
       }

       if (players.some(p => p.name === playerNameInput.trim())) {
           alert('Este nombre ya está en uso');
           return;
       }

       const playerData = {
           id: `Jugador ${players.length + 1}`,
           name: playerNameInput.trim(),
           position: null,
           direction: "down"
       };

       console.log('Enviando jugador:', playerData);

       try {
            await createPlayer(playerData);
            console.log("Jugador creado en la base de datos:", playerData);
           stompClient.publish({
               destination: '/app/players',
               body: JSON.stringify(playerData)
           });
       } catch (error) {
           console.error('Error al enviar jugador:', error);
       }
   };

   const startGame = () => {
    console.log('Estado actual:', {
        players,
        myPlayerId,
        hasJoined,
    });

    if (players.length < 2) {
        alert('Se necesitan al menos 2 jugadores');
        return;
    }

    // Encuentra al jugador actual
    const myPlayer = players.find(player => player.id === myPlayerId);
    console.log('Lista de jugadores:', players);
    console.log('Mi ID de jugador:', myPlayerId);
    console.log('Jugador encontrado:', myPlayer);

    if (!myPlayer) {
        console.error('No se encontró al jugador actual en la lista');
        return;
    }

    // Asignar posición única basada en el índice del jugador
    const myIndex = players.indexOf(myPlayer);
    const predefinedPositions = [
        { x: 1, y: 1 },
        { x: 2, y: 9 },
        { x: 5, y: 5 },
        { x: 8, y: 3 }, // Posiciones adicionales si hay más jugadores
    ];
    const myPosition =
        predefinedPositions[myIndex] || { x: 0, y: 0 }; // Posición por defecto si excede las predefinidas

    // Actualizar solo mi jugador
    const myUpdatedPlayer = {
        ...myPlayer,
        position: myPosition,
    };

    console.log('Iniciando juego con mi jugador:', myUpdatedPlayer);

    // Llamar a onStartGame solo con la información del jugador actual
    onStartGame(myUpdatedPlayer);
};


   return (
       <div className="waiting-room-container">
           <div className="waiting-room-box">
               <h2 className="waiting-room-title">Battle City Remake</h2>
               <p className="waiting-room-subtitle">Sala de Espera</p>
               <p className="connection-status">Estado: {connectionStatus}</p>
               
               <div className="player-input-container">
                   <input 
                       type="text" 
                       value={playerNameInput}
                       onChange={(e) => setPlayerNameInput(e.target.value)}
                       placeholder="Ingresa tu nombre"
                       className="player-input"
                       disabled={hasJoined}
                   />
                   <button 
                       onClick={addPlayer} 
                       className="add-player-button"
                       disabled={hasJoined || players.length >= 4}
                   >
                       {hasJoined ? 'Ya unido' : 'Unirse'}
                   </button>
               </div>

               <p>Jugadores: {players.length}/4</p>
               <div>
                   <h3>Jugadores en sala:</h3>
                   <ul className="players-list">
                       {players.length === 0 ? (
                           <li>No hay jugadores</li>
                       ) : (
                           players.map((player) => (
                               <li key={player.id}>
                                   {player.name} {player.id === myPlayerId ? '(Tú)' : ''}
                               </li>
                           ))
                       )}
                   </ul>
               </div>
               
               <button 
                   onClick={startGame} 
                   className="start-game-button"
                   disabled={players.length < 2}
               >
                   Comenzar Juego ({players.length}/2 necesarios)
               </button>
           </div>
       </div>
   );
};

export default WaitingRoom;