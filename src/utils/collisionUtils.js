class CollisionUtils {
    constructor(mapData) {
        this.mapData = mapData;
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