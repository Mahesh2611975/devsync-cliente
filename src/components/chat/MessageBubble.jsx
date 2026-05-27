import React from "react";
import CodeBlock from "./CodeBlock";

export default function MessageBubble({ message }) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isMe = message?.senderId === currentUser?.userId;
  
  // Bulletproof type check: forces uppercase so it never fails
  const isCode = message?.type?.toUpperCase() === "CODE";
  
  const senderLabel = message?.senderName?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className={`flex w-full mb-4 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#FF4500] shrink-0 border border-white/5">
          {senderLabel}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-400">
              {message?.senderName || "Unknown User"}
            </span>
            <span className="text-[9px] text-gray-600">
              {message?.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>

          {/* Message Body */}
          <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-[#FF4500] text-white rounded-tr-none" : "bg-[#1a1a1a] text-gray-200 rounded-tl-none border border-white/5"}`}>
            {isCode ? (
              <CodeBlock code={message.content} language={message.codeLanguage} />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed break-words">
                {message.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}