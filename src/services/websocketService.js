import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;

let isConnected = false;

let connectionCallbacks = [];

export const connect = (onConnected) => {

    // Prevent duplicate connections
    if (stompClient?.connected) {

        console.log(
            "WebSocket already connected"
        );

        if (onConnected) {
            onConnected();
        }

        return;
    }

    console.log(
        "Initializing WebSocket connection..."
    );

    const socket = new SockJS(
        "http://localhost:8080/ws-provider"
    );

    stompClient = Stomp.over(socket);

    // Optional: disable noisy logs
    stompClient.debug = null;

    // IMPORTANT
    // JWT token for interceptor auth
    const token =
        localStorage.getItem("token");

    if (!token) {

        console.error(
            "JWT token missing from localStorage"
        );

        return;
    }

    stompClient.connect(

        {
            Authorization: `Bearer ${token}`
        },

        () => {

            console.log(
                "WebSocket Connected Successfully"
            );

            isConnected = true;

            // Global access (optional)
            window.stompClient = stompClient;

            // Execute queued callbacks
            connectionCallbacks.forEach(
                (cb) => cb()
            );

            connectionCallbacks = [];

            if (onConnected) {
                onConnected();
            }
        },

        (err) => {

            console.error(
                "STOMP connection error:",
                err
            );

            isConnected = false;
        }
    );
};

export const disconnect = () => {

    if (stompClient) {

        stompClient.disconnect(() => {

            console.log(
                "WebSocket Disconnected"
            );

            isConnected = false;
        });
    }
};

export const subscribeToChannel = (
    channelId,
    onMessageReceived
) => {

    // Wait until socket ready
    if (!stompClient || !isConnected) {

        console.log(
            "Connection pending, queueing subscription:",
            channelId
        );

        const callback = () => {

            subscribeToChannel(
                channelId,
                onMessageReceived
            );
        };

        connectionCallbacks.push(callback);

        return {
            unsubscribe: () => {

                connectionCallbacks =
                    connectionCallbacks.filter(
                        (cb) => cb !== callback
                    );
            }
        };
    }

    console.log(
        "Subscribing to channel:",
        channelId
    );

    return stompClient.subscribe(

        `/topic/channel/${channelId}`,

        (payload) => {

            const message =
                JSON.parse(payload.body);

            console.log(
                "Message received:",
                message
            );

            onMessageReceived(message);
        }
    );
};

export const sendChatMessage = (
    channelId,
    senderId,
    content
) => {

    console.log(
        "Attempting to send message..."
    );

    console.log(
        "Socket connected:",
        isConnected
    );

    if (!stompClient || !isConnected) {

        console.error(
            "Cannot send message: WebSocket not connected."
        );

        return false;
    }

    const payload = {

        channelId,
        senderId,
        content,
        type: "TEXT"
    };

    console.log(
        "Sending payload:",
        payload
    );

    stompClient.send(

        "/app/chat.sendToChannel",

        {},

        JSON.stringify(payload)
    );

    console.log(
        "Message sent successfully"
    );

    return true;
};

export const getConnectionStatus = () => {

    return isConnected;
};