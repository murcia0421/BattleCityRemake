import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws";
let stompClient = null;
let currentSubscriptions = new Map();

export const connectToRoom = (roomName, onMessageReceived) => {
    if (stompClient && stompClient.connected) {
        subscribeToRoom(roomName, onMessageReceived);
        return;
    }

    const socket = new SockJS(SOCKET_URL);
    stompClient = Stomp.over(socket);

    stompClient.debug = () => {}; // Disable STOMP debug logs

    stompClient.connect(
        {},
        () => {
            console.log("Connected to WebSocket");
            subscribeToRoom(roomName, onMessageReceived);
        },
        (error) => {
            console.error("WebSocket connection error:", error);
            setTimeout(() => {
                if (!stompClient.connected) {
                    connectToRoom(roomName, onMessageReceived);
                }
            }, 5000);
        }
    );
};

const subscribeToRoom = (roomName, onMessageReceived) => {
    if (!currentSubscriptions.has(roomName)) {
        const subscription = stompClient.subscribe("/topic/room-status", (message) => {
            if (message.body) {
                const parsedMessage = JSON.parse(message.body);
                console.log("WebSocket received message:", parsedMessage);
                onMessageReceived(parsedMessage);
            }
        });

        currentSubscriptions.set(roomName, subscription);
        stompClient.send("/app/enter-room", {}, JSON.stringify({ roomName }));
    }
};

export const leaveRoom = (roomName) => {
    if (currentSubscriptions.has(roomName)) {
        const subscription = currentSubscriptions.get(roomName);
        subscription.unsubscribe();
        currentSubscriptions.delete(roomName);
        stompClient.send("/app/leave-room", {}, JSON.stringify({ roomName }));
    }
};
