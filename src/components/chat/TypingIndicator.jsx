import React from 'react';

export default function TypingIndicator({ isTyping }) {
  if (!isTyping) return <div className="h-4" />; // Maintain layout height

  return (
    <div className="px-4 py-1 text-[10px] text-[#FF4500] font-mono animate-pulse">
      Someone is typing...
    </div>
  );
}