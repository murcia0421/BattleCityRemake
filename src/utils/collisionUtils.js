class CollisionUtils {
    constructor(mapData) {
        this.mapData = mapData;
    }

    checkCollision(position) {
        const { x, y } = position;
        if (x < 0 || x >= this.mapData[0].length || y < 0 || y >= this.mapData.length) {
            return true;
        }
        const tile = this.mapData[Math.floor(y)][Math.floor(x)];
        return tile === 1 || tile === 2;
    }

    checkWallCollision(x, y) {
        if (x < 0 || x >= this.mapData[0].length || y < 0 || y >= this.mapData.length) {
            return false;
        }
        return this.mapData[Math.floor(y)][Math.floor(x)] === 1;
    }

    isDestructibleWall(x, y) {
        return this.mapData[Math.floor(y)][Math.floor(x)] === 1;
    }
}

export default CollisionUtils;