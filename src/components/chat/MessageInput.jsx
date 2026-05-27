import React, { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [messageType, setMessageType] = useState("TEXT");
  const [language, setLanguage] = useState("javascript");

  const handleSend = () => {
    if (!text.trim()) return;

    onSend({
      content: text,
      type: messageType,
      codeLanguage: messageType === "CODE" ? language : null,
    });

    setText("");
  };

  return (
    <div className="p-4 border-t border-white/5 bg-[#050505]">
      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        {/* Message Type */}
        <select
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
          className="bg-[#111] text-xs text-white border border-white/10 rounded px-2 py-1"
        >
          <option value="TEXT">TEXT</option>
          <option value="CODE">CODE</option>
        </select>

        {/* Language */}
        {messageType === "CODE" && (
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#111] text-xs text-white border border-white/10 rounded px-2 py-1"
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        )}
      </div>

      {/* Input */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-lg flex items-end px-4">
        <textarea
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder={messageType === "CODE" ? "Paste code snippet..." : "Send message..."}
          className="w-full bg-transparent py-3 outline-none text-sm text-white resize-none min-h-[60px]"
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          className="text-[#FF4500] text-xs font-bold uppercase ml-3 mb-3"
        >
          Send
        </button>
      </div>
    </div>
  );
}