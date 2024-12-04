export class BulletManager {
    static BULLET_SPEED = 0.15;
    
    constructor(gameState, collisionUtils) {
        this.gameState = gameState;
        this.collisionUtils = collisionUtils;
        this.bullets = new Map();
    }

    createBullet(playerId, position, direction) {
        const bullet = {
            id: `${playerId}-${Date.now()}`,
            playerId,
            position: { ...position },
            direction,
            speed: BulletManager.BULLET_SPEED
        };
        this.bullets.set(bullet.id, bullet);
        return bullet;
    }

    updatePositions() {
        for (const [bulletId, bullet] of this.bullets.entries()) {
            const newPosition = this.calculateNewPosition(bullet);
            
            // Check wall collision
            if (this.collisionUtils.checkWallCollision(newPosition.x, newPosition.y)) {
                if (this.collisionUtils.isDestructibleWall(newPosition.x, newPosition.y)) {
                    this.gameState.destroyWall(Math.floor(newPosition.x), Math.floor(newPosition.y));
                }
                this.bullets.delete(bulletId);
                continue;
            }

            // Check player collision
            const hitPlayer = this.checkPlayerCollision(newPosition, bullet.playerId);
            if (hitPlayer) {
                this.gameState.handlePlayerHit(hitPlayer.id);
                this.bullets.delete(bulletId);
                continue;
            }

            // Update position if no collision
            bullet.position = newPosition;
        }
    }

    calculateNewPosition(bullet) {
        const { position, direction, speed } = bullet;
        const newPosition = { ...position };

        switch (direction) {
            case 'up': newPosition.y -= speed; break;
            case 'down': newPosition.y += speed; break;
            case 'left': newPosition.x -= speed; break;
            case 'right': newPosition.x += speed; break;
        }

        return newPosition;
    }

    checkPlayerCollision(bulletPosition, shooterId) {
        for (const [playerId, player] of this.gameState.players.entries()) {
            if (playerId === shooterId || !player.isAlive) continue;

            const hitbox = {
                minX: player.position.x - 0.4,
                maxX: player.position.x + 0.4,
                minY: player.position.y - 0.4,
                maxY: player.position.y + 0.4
            };

            if (bulletPosition.x > hitbox.minX && 
                bulletPosition.x < hitbox.maxX && 
                bulletPosition.y > hitbox.minY && 
                bulletPosition.y < hitbox.maxY) {
                return player;
            }
        }
        return null;
    }
}