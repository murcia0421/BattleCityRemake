
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const CollisionUtils = require('../utils/collisionUtils'); // Importar la clase de colisiones
//const mapData = require('./data/mapData'); // Importar datos del mapa
const mapData = require('../components/Map/MapData'); // Importar datos del mapa

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const HOST = window.location.host;
let players = {}; // Almacena la información de los jugadores
const collisionUtils = new CollisionUtils(mapData); // Instanciar CollisionUtils con los datos del mapa

io.on('connection', (socket) => {
    console.log('Nuevo jugador conectado:', socket.id);

    // Inicializa el jugador
    players[socket.id] = { id: socket.id, position: { x: 0, y: 0 } };

    // Enviar información inicial del juego al nuevo jugador
    socket.emit('initGame', { players, mapData });

    // Manejar el movimiento del jugador
    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            const newPosition = calculateNewPosition(players[socket.id].position, data.direction);

            // Verificar colisiones antes de actualizar la posición
            if (!collisionUtils.checkCollision(newPosition)) {
                players[socket.id].position = newPosition;
                socket.broadcast.emit('playerMoved', players[socket.id]);
            }
        }
    });

    // Manejar el disparo
    socket.on('shoot', (bulletData) => {
        // Lógica para manejar el disparo
        const bullet = { id: Date.now(), position: bulletData.position, direction: bulletData.direction };
        socket.broadcast.emit('bulletFired', { playerId: socket.id, bullet });
    });

    // Manejar desconexión del jugador
    socket.on('disconnect', () => {
        console.log('Jugador desconectado:', socket.id);
        delete players[socket.id];
    });
});

// Función para calcular la nueva posición
const calculateNewPosition = (currentPosition, direction) => {
    switch (direction) {
        case 'up':
            return { x: currentPosition.x, y: currentPosition.y - 1 };
        case 'down':
            return { x: currentPosition.x, y: currentPosition.y + 1 };
        case 'left':
            return { x: currentPosition.x - 1, y: currentPosition.y };
        case 'right':
            return { x: currentPosition.x + 1, y: currentPosition.y };
        default:
            return currentPosition;
    }
};

server.listen(8080, () => {
    console.log('Servidor escuchando en' + `http://${HOST}`);
});
