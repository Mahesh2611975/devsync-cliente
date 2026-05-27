import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };
  return (
    <div className="p-4 border-t border-white/5">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-lg flex items-center px-4">
        <input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="w-full bg-transparent py-3 outline-none text-sm text-white"
        />
        <button onClick={handleSend} className="text-[#FF4500] text-xs font-bold uppercase">Send</button>
      </div>
    </div>
  );
}