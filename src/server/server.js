const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('Nuevo jugador conectado:', socket.id);

    socket.on('collision', (data) => {
        console.log(`Colisión detectada para el jugador: ${data.playerId}`);
        // Lógica para manejar colisiones
    });

    socket.on('playerMoved', (data) => {
        // Emitir el movimiento a otros jugadores
        socket.broadcast.emit('playerMoved', data);
    });
});

server.listen(8080, () => {
    console.log('Servidor escuchando en http://localhost:8080');
});
