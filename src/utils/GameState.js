
export class GameState {
    
    constructor() {
        this.players = new Map();
        this.bullets = new Map();
        this.destroyedWalls = new Set();
        this.scores = new Map();
    }

    addPlayer(player) {
        this.players.set(player.id, {
            ...player,
            lives: 3,
            isAlive: true,
            score: 0
        });
    }

    updatePlayerPosition(playerId, position, direction) {
        const player = this.players.get(playerId);
        if (player) {
            player.position = position;
            player.direction = direction;
        }
    }

    handlePlayerHit(playerId) {
        const player = this.players.get(playerId);
        if (player && player.lives > 0) {
            player.lives--;
            if (player.lives === 0) {
                player.isAlive = false;
                setTimeout(() => this.respawnPlayer(playerId), 5000);
            }
            return true;
        }
        return false;
    }

    respawnPlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.lives = 3;
            player.isAlive = true;
            player.position = this.getRandomSpawnPoint();
        }
    }

    destroyWall(x, y) {
        const wallKey = `${x},${y}`;
        if (!this.destroyedWalls.has(wallKey)) {
            this.destroyedWalls.add(wallKey);
            return true;
        }
        return false;
    }

    getRandomSpawnPoint() {
        const spawnPoints = [
            { x: 1, y: 1 },
            { x: 24, y: 1 },
            { x: 1, y: 23 },
            { x: 24, y: 23 }
        ];
        return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    }
}