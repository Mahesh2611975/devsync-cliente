import React from "react";
import CodeBlock from "./CodeBlock";

export default function MessageBubble({ message }) {
  const senderLabel = message?.senderName
    ? message.senderName.substring(0, 2).toUpperCase()
    : "U";

  const isCode = message?.type === "CODE";

  return (
    <div className="flex gap-3 hover:bg-white/5 p-3 rounded-lg transition">
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-[#FF4500] shrink-0">
        {senderLabel}
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">
            {message?.senderName || "Unknown"}
          </span>
          <span className="text-[10px] text-gray-500">
            {message?.type}
          </span>
        </div>

        {/* Text Message */}
        {!isCode && (
          <p className="text-sm text-gray-300 break-words">
            {message?.content || ""}
          </p>
        )}

        {/* Code Message */}
        {isCode && (
          <CodeBlock 
            code={message.content} 
            language={message.codeLanguage} 
          />
        )}
      </div>
    </div>
  );
}