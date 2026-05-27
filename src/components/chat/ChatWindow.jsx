import React, { useEffect, useState } from "react";
import { connect, subscribeToChannel, sendChatMessage } from "../../services/websocketService";
import { fetchMessageHistory } from "../../services/messageService";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "../shared/EmptyState";

export default function ChatWindow({ channel }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (!channel) return;

    // 1. Fetch History and FORCE Chronological Order (Oldest -> Newest)
    fetchMessageHistory(channel.id)
      .then((history) => {
        const historyArray = Array.isArray(history) ? history : [];
        
        // Sort strictly by timestamp so they display one after another sequentially
        const sortedHistory = [...historyArray].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeA - timeB; 
        });
        
        setMessages(sortedHistory);
      })
      .catch((err) => console.error("Failed to load history", err));

    // 2. Connect WebSockets for Real-Time Stream updates
    connect(() => {
      setSocketReady(true);
      
      const messageSub = subscribeToChannel(channel.id, (msg) => {
        // Appends new messages strictly sequentially to the bottom of the array stream
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      });

      const typingSub = window.stompClient?.subscribe(`/topic/channel/${channel.id}/typing`, () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });

      return () => {
        messageSub?.unsubscribe();
        typingSub?.unsubscribe();
      };
    });
  }, [channel]);

  if (!channel) {
    return <EmptyState icon="💬" title="No Channel Selected" message="Select a channel to begin." />;
  }

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <div className="p-4 border-b border-white/5 font-bold text-white text-lg"># {channel.name}</div>
      <MessageList messages={messages} />
      <TypingIndicator isTyping={isTyping} />
      <MessageInput
        disabled={!socketReady}
        onSend={(payload) => {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          sendChatMessage(
            channel.id,
            currentUser?.userId || currentUser?.id,
            payload.content,
            payload.type,
            payload.codeLanguage
          );
        }}
      />
    </div>
  );
}