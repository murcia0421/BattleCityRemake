// frontend/src/websocket/WebSocketClient.js
class WebSocketClient {
    static socket = null;

    static initialize(onMessage) {
        this.socket = new WebSocket('ws://localhost:3000');
        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            onMessage(message);
        };
        this.socket.onclose = () => {
            console.log('WebSocket disconnected. Reconnecting...');
            setTimeout(() => this.initialize(onMessage), 3000);
        };
    }

    static sendAction(action) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(action));
        }
    }
}

export default WebSocketClient;
