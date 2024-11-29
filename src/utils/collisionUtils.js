// collisionUtils.js
class CollisionUtils {
    constructor(mapData) {
        this.mapData = mapData;
    }
    handleBulletWallCollision(bullet, mapData) {
        const tileX = Math.floor(bullet.x);
        const tileY = Math.floor(bullet.y);
    
        // Verifica si la bala ha impactado una pared destructible (ladrillo)
        if (this.mapData[tileY] && this.mapData[tileY][tileX] === 1) {
          // Destruye la pared (cambia el tile a 0 - espacio vacío)
          this.mapData[tileY][tileX] = 0;
          return true; // Indica que hubo una colisión
        }dds
        return false;
      }

    checkCollision(position) {
        const { x, y } = position;
        if (x < 0 || x >= this.mapData[0].length || y < 0 || y >= this.mapData.length) {
            return true; // Fuera del rango se considera una colisión
        }
        const tile = this.mapData[y][x];
        return tile === 1 || tile === 2; // 1 = muro de ladrillo, 2 = muro de acero
    }

    isBulletOnBoard(bullet) {
        const { x, y } = bullet.position;
        return x >= 0 && x < this.mapData[0].length && y >= 0 && y < this.mapData.length;
    }

    bulletCollision(bullet) {
        const { x, y } = bullet.position;
        if (!this.isBulletOnBoard(bullet)) {
            return true; // La bala está fuera del rango
        }
        const tile = this.mapData[y][x];
        return tile === 1 || tile === 2; // Colisión con muros de ladrillo o acero
    }
}

export default CollisionUtils;
