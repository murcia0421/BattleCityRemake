// src/websocket/WebSocketClient.js
class WebSocketClient {
    static socket = null;
    static isReconnecting = false;
    static messageQueue = [];
    static onMessageCallback = null;
    static onErrorCallback = null;
    static onCloseCallback = null;
    static eventCallbacks = {}; // Almacenar callbacks de eventos
    static HOST = window.location.host;

    static initialize(onMessage, onError = null, onClose = null, serverUrl = `ws://${HOST}:3000`, retryDelay = 3000) {
        if (this.isReconnecting) return;
        this.isReconnecting = true;
        this.onMessageCallback = onMessage;
        this.onErrorCallback = onError;
        this.onCloseCallback = onClose;

        this.socket = new WebSocket(serverUrl);
        this.socket.onopen = () => this.handleOpen(retryDelay);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onclose = () => this.handleClose(retryDelay);
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
        // Notificar a otros suscriptores
        this.trigger('message', JSON.parse(event.data));
    }

    static handleError(error) {
        console.error('WebSocket error:', error);
        if (this.onErrorCallback) {
            this.onErrorCallback(error);
        }
        // Notificar a otros suscriptores
        this.trigger('error', error);
    }

    static handleClose(retryDelay) {
        console.log('WebSocket disconnected. Reconnecting in', retryDelay, 'ms...');
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
        setTimeout(() => {
            this.isReconnecting = false;
            this.initialize(this.onMessageCallback, this.onErrorCallback, this.onCloseCallback, undefined, retryDelay * 2);
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

    // Método para suscribirse a eventos
    static on(event, callback) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);
    }

    // Método para cancelar la suscripción a eventos
    static off(event, handler) {
        if (!this.eventCallbacks[event]) return;

        this.eventCallbacks[event] = this.eventCallbacks[event].filter(h => h !== handler);
    }

    // Método para disparar eventos
    static trigger(event, data) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => callback(data));
        }
    }
}

export default WebSocketClient;
