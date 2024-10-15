// src/components/Player.js
class Player {
    constructor(id, position) {
        this.id = id;
        this.position = position;
    }

    move(direction) {
        switch (direction) {
            case 'up':
                this.position.y -= 1;
                break;
            case 'down':
                this.position.y += 1;
                break;
            case 'left':
                this.position.x -= 1;
                break;
            case 'right':
                this.position.x += 1;
                break;
        }
        renderPlayer(this);

        socket.emit('playerMoved', { playerId: this.id, position: this.position });
    }
}

// Función para renderizar al jugador
function renderPlayer(player) {
    // Lógica para renderizar el jugador en el juego
}
