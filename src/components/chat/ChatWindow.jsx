import React, { useEffect, useState } from "react";

import {
    connect,
    subscribeToChannel,
    sendChatMessage
} from "../../services/websocketService";

import {
    fetchMessageHistory
} from "../../services/messageService";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "../shared/EmptyState";

export default function ChatWindow({ channel }) {

    const [messages, setMessages] =
        useState([]);

    const [isTyping, setIsTyping] =
        useState(false);

    const [socketReady, setSocketReady] =
        useState(false);

    useEffect(() => {

        if (!channel) return;

        console.log(
            "Initializing chat window..."
        );

        let messageSub = null;

        let typingSub = null;

        // 1. Fetch previous messages
        fetchMessageHistory(channel.id)

            .then((data) => {

                console.log(
                    "Loaded message history:",
                    data
                );

                setMessages(data);
            })

            .catch((err) => {

                console.error(
                    "Failed to load message history",
                    err
                );
            });

        // 2. Connect websocket
        connect(() => {

            console.log(
                "WebSocket fully connected"
            );

            setSocketReady(true);

            // Prevent duplicate subscriptions
            if (messageSub) {
                messageSub.unsubscribe();
            }

            // 3. Subscribe to channel
            messageSub = subscribeToChannel(

                channel.id,

                (msg) => {

                    console.log(
                        "Incoming message:",
                        msg
                    );

                    setMessages((prev) => {

                        // Prevent duplicate messages
                        const exists =
                            prev.some(
                                (m) => m.id === msg.id
                            );

                        if (exists) {
                            return prev;
                        }

                        return [...prev, msg];
                    });
                }
            );

            // 4. Subscribe to typing events
            typingSub =
                window.stompClient?.subscribe(

                    `/topic/channel/${channel.id}/typing`,

                    () => {

                        setIsTyping(true);

                        setTimeout(() => {

                            setIsTyping(false);

                        }, 3000);
                    }
                );
        });

        // Cleanup
        return () => {

            console.log(
                "Cleaning chat subscriptions..."
            );

            if (messageSub) {
                messageSub.unsubscribe();
            }

            if (typingSub) {
                typingSub.unsubscribe();
            }
        };

    }, [channel]);

    if (!channel) {

        return (

            <EmptyState
                icon="💬"
                title="No Channel Selected"
                message="Select a channel from the sidebar to begin secure communication."
            />
        );
    }

    return (

        <div
            className="
                flex
                flex-col
                h-full
                bg-[#050505]
            "
        >

            {/* Header */}
            <div
                className="
                    p-4
                    border-b
                    border-white/5
                    font-bold
                    text-white
                "
            >
                # {channel.name}
            </div>

            {/* Messages */}
            <MessageList messages={messages} />

            {/* Typing */}
            <TypingIndicator isTyping={isTyping} />

            {/* Input */}
            <MessageInput

                disabled={!socketReady}

                onSend={(text) => {

                    console.log(
                        "Sending message..."
                    );

                    sendChatMessage(
                        channel.id,
                        1,
                        text
                    );
                }}
            />

        </div>
    );
}