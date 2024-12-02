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

        // Verificar límites del mapa
        if (x < 0 || x >= this.mapData[0].length || y < 0 || y >= this.mapData.length) {
            return true;
        }

        // Obtener el tipo de tile en la posición
        const tile = this.mapData[Math.floor(y)][Math.floor(x)];
        
        // 0 es espacio vacío, 1 es muro de ladrillo, 2 es muro de acero
        return tile === 1 || tile === 2;
    }
}

export default CollisionUtils;