class WebSocketClient {
    static socket = null;
    static isReconnecting = false;
    static messageQueue = [];
    static onMessageCallback = null;

    static initialize(onMessage, retryDelay = 3000) {
        if (this.isReconnecting) return;
        this.isReconnecting = true;
        this.onMessageCallback = onMessage;

        this.socket = new WebSocket('ws://localhost:3000');
        this.socket.onopen = this.handleOpen.bind(this, retryDelay);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onclose = this.handleClose.bind(this, retryDelay);
    }

    static handleOpen(retryDelay) {
        console.log('WebSocket connected');
        this.isReconnecting = false;
        this.flushQueue();
    }

    static handleMessage(event) {
        if (this.onMessageCallback) {
            const message = JSON.parse(event.data);
            this.onMessageCallback(message);
        }
    }

    static handleError(error) {
        console.error('WebSocket error:', error);
    }

    static handleClose(retryDelay) {
        console.log('WebSocket disconnected. Reconnecting in', retryDelay, 'ms...');
        setTimeout(() => {
            this.isReconnecting = false;
            this.initialize(this.onMessageCallback, retryDelay * 2);
        }, retryDelay);
    }

    static sendAction(action) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(action));
        } else {
            this.messageQueue.push(action);
        }
    }
    static flushQueue() {
        while (this.messageQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(this.messageQueue.shift()));
        }
    }
}

export default WebSocketClient;
