import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws";
let stompClient = null;
let currentSubscriptions = new Map(); // Para mantener track de las suscripciones

export const connectToRoom = (roomName, onMessageReceived) => {
    // Si ya existe una conexión activa, solo nos suscribimos al nuevo room
    if (stompClient && stompClient.connected) {
        subscribeToRoom(roomName, onMessageReceived);
        return;
    }

    // Si no hay conexión, creamos una nueva
    const socket = new SockJS(SOCKET_URL);
    stompClient = Stomp.over(socket);
    
    // Deshabilitar logs de STOMP
    stompClient.debug = () => {};

    stompClient.connect(
        {},
        () => {
            console.log("Connected to WebSocket");
            subscribeToRoom(roomName, onMessageReceived);
        },
        (error) => {
            console.error("WebSocket connection error:", error);
            // Intentar reconectar en caso de error
            setTimeout(() => {
                if (!stompClient?.connected) {
                    connectToRoom(roomName, onMessageReceived);
                }
            }, 5000);
        }
    );
};

const subscribeToRoom = (roomName, onMessageReceived) => {
    // Verificar si ya existe una suscripción para esta sala
    if (!currentSubscriptions.has(roomName)) {
        const subscription = stompClient.subscribe("/topic/room-status", (message) => {
            if (message.body) {
                const parsedMessage = JSON.parse(message.body);
                console.log("WebSocket received message:", parsedMessage);
                onMessageReceived(parsedMessage);
            }
        });

        // Guardar la suscripción
        currentSubscriptions.set(roomName, subscription);
        
        // Enviar solicitud para unirse a la sala
        stompClient.send("/app/join", {}, roomName);
    }
};

export const leaveRoom = (roomName) => {
    if (stompClient?.connected) {
        try {
            // Enviamos mensaje de leave
            stompClient.send("/app/leave", {}, roomName);
            console.log(`Left room: ${roomName}`);

            // Cancelar la suscripción específica de esta sala
            const subscription = currentSubscriptions.get(roomName);
            if (subscription) {
                subscription.unsubscribe();
                currentSubscriptions.delete(roomName);
            }

            // Solo desconectamos si no hay más suscripciones activas
            if (currentSubscriptions.size === 0) {
                stompClient.disconnect(() => {
                    console.log("Disconnected from WebSocket");
                    stompClient = null;
                });
            }
        } catch (error) {
            console.error("Error while leaving room:", error);
        }
    }
};

export const isConnected = () => {
    return stompClient && stompClient.connected;
};