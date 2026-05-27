import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages }) {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-4">
      {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
    </div>
  );
}