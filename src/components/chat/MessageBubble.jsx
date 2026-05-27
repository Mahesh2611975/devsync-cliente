import React from "react";
import CodeBlock from "./CodeBlock";

export default function MessageBubble({ message }) {
  // Fallback label for avatar: first 2 chars of the sender's name
  const senderLabel = message?.senderName?.substring(0, 2).toUpperCase() || "U";
  const isCode = message?.type === "CODE";

  return (
    <div className="flex gap-4 hover:bg-white/5 p-3 rounded-lg transition-colors group">
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-[#111] flex items-center justify-center text-[10px] font-bold text-[#FF4500] border border-white/10 shrink-0">
        {senderLabel}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {message?.senderName || "Unknown User"}
          </span>
          <span className="text-[10px] text-gray-600">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {isCode ? (
          <CodeBlock code={message.content} language={message.codeLanguage} />
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed break-words">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}