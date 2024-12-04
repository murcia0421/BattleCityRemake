export class NetworkManager {
    constructor(stompClient, gameState) {
        this.stompClient = stompClient;
        this.gameState = gameState;
        this.subscribers = new Map();
    }

    connect() {
        if (this.stompClient.connected) return;

        return new Promise((resolve, reject) => {
            this.stompClient.connect({}, 
                () => {
                    this.setupSubscriptions();
                    resolve();
                },
                error => reject(error)
            );
        });
    }

    setupSubscriptions() {
        this.subscribe('/topic/game-updates', message => {
            const update = JSON.parse(message.body);
            switch (update.type) {
                case 'PLAYER_MOVE':
                    this.gameState.updatePlayerPosition(
                        update.playerId,
                        update.position,
                        update.direction
                    );
                    break;
                case 'WALL_DESTROYED':
                    this.gameState.destroyWall(update.x, update.y);
                    break;
                case 'PLAYER_HIT':
                    this.gameState.handlePlayerHit(update.playerId);
                    break;
            }
        });
    }

    sendUpdate(destination, data) {
        if (!this.stompClient.connected) return;
        
        this.stompClient.publish({
            destination: `/app/${destination}`,
            body: JSON.stringify(data)
        });
    }

    subscribe(topic, callback) {
        if (!this.stompClient.connected) return;

        const subscription = this.stompClient.subscribe(topic, callback);
        this.subscribers.set(topic, subscription);
        return subscription;
    }

    unsubscribe(topic) {
        const subscription = this.subscribers.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscribers.delete(topic);
        }
    }

    disconnect() {
        this.subscribers.forEach(subscription => subscription.unsubscribe());
        this.subscribers.clear();
        if (this.stompClient.connected) {
            this.stompClient.disconnect();
        }
    }
}