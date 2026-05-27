import React, { useState } from 'react';

export default function CreateChannelModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreated(name);
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#09090b] p-6 rounded-xl border border-white/10 w-96 shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4">Create New Channel</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs text-gray-400 mb-2 font-medium">CHANNEL NAME</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <span className="text-gray-500 mr-2">#</span>
              <input 
                autoFocus
                className="bg-transparent w-full text-white outline-none placeholder-gray-600 text-sm"
                placeholder="e.g. engineering"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[#FF4500] hover:bg-[#ff5e21] text-white text-sm px-6 py-2 rounded-lg font-semibold transition shadow-[0_0_15px_rgba(255,69,0,0.3)]"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}