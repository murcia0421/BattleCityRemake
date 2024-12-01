import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import './WaitingRoom.css';

const WaitingRoom = ({ playerName, onStartGame }) => {
   const [stompClient, setStompClient] = useState(null);
   const [players, setPlayers] = useState([]);
   const [connectionStatus, setConnectionStatus] = useState('disconnected');
   const [hasJoined, setHasJoined] = useState(false);
   const [myPlayerId, setMyPlayerId] = useState(null);
   const [playerNameInput, setPlayerNameInput] = useState('');

   useEffect(() => {
       const connectToWebSocket = () => {
           try {
               const socket = new SockJS('http://localhost:8080/ws');
               const client = new Client({
                   webSocketFactory: () => socket,
                   reconnectDelay: 5000,
                   debug: (str) => {
                       console.log('STOMP Debug:', str);
                   },
                   onConnect: () => {
                       console.log('Conectado al servidor');
                       setConnectionStatus('connected');
                       
                       client.subscribe('/topic/players', (message) => {
                           console.log('Mensaje recibido del servidor:', message.body);
                           try {
                               const data = JSON.parse(message.body);
                               
                               if (Array.isArray(data)) {
                                   setPlayers(data);
                                   // Verificar si ya estamos en la lista
                                   const myPlayer = data.find(p => p.name === playerNameInput);
                                   if (myPlayer) {
                                       setMyPlayerId(myPlayer.id);
                                       setHasJoined(true);
                                   }
                                   return;
                               }

                               setPlayers(current => {
                                   if (current.length >= 4) return current;

                                   const existingPlayerIndex = current.findIndex(p => p.id === data.id);
                                   if (existingPlayerIndex !== -1) {
                                       const newPlayers = [...current];
                                       newPlayers[existingPlayerIndex] = data;
                                       return newPlayers;
                                   }

                                   return [...current, data];
                               });

                               // Si este es nuestro jugador
                               if (data.name === playerNameInput) {
                                   setMyPlayerId(data.id);
                                   setHasJoined(true);
                               }
                           } catch (e) {
                               console.error('Error al procesar mensaje:', e);
                           }
                       });

                       // Solicitar lista actual de jugadores
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

               return client;
           } catch (error) {
               console.error('Error al conectar:', error);
               setConnectionStatus('error');
           }
       };

       const client = connectToWebSocket();

       return () => {
           if (client && client.connected) {
               try {
                   client.publish({
                       destination: '/app/player-leave',
                       body: JSON.stringify({ id: myPlayerId })
                   });
               } finally {
                   client.deactivate();
               }
           }
       };
   }, [myPlayerId, playerNameInput]);

   const addPlayer = () => {
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

       if (!stompClient || !stompClient.connected) {
           alert('No hay conexión con el servidor');
           return;
       }

       if (players.some(p => p.name === playerNameInput.trim())) {
           alert('Este nombre ya está en uso');
           return;
       }

       const playerData = {
           name: playerNameInput.trim(),
           position: null,
           direction: "down"
       };

       try {
           stompClient.publish({
               destination: '/app/players',
               body: JSON.stringify(playerData)
           });
       } catch (error) {
           console.error('Error al enviar mensaje:', error);
           alert('Error al unirse a la sala');
       }
   };

   const startGame = () => {
       if (players.length < 2) {
           alert('Se necesitan al menos 2 jugadores');
           return;
       }

       // Asignar posiciones a los jugadores
       const playersWithPositions = players.map((player, index) => ({
           ...player,
           position: index === 0 ? { x: 1, y: 1 } : { x: 2, y: 9 }
       }));

       // Llamar a onStartGame con los jugadores y sus posiciones
       onStartGame(playersWithPositions);
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