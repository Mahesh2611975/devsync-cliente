import React from 'react';
import EmptyState from '../shared/EmptyState';

export default function ChatWindow({ channel }) {
  // 1. Unified Empty state handling
  if (!channel) {
    return (
      <EmptyState 
        icon="💬"
        title="No Channel Selected"
        message="Select a channel from the sidebar to begin secure, real-time communication."
      />
    );
  }

  // 2. Active Channel view
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-white"># {channel.name}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {channel.description || `Secure conversation channel for ${channel.name}`}
        </p>
      </div>

      {/* Placeholder for future message stream */}
      <div className="flex-1 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-gray-600 font-mono">
        [ WebSocket Pipeline Active: Channel ID {channel.id} ]
      </div>

      {/* Input area */}
      <div className="h-12 bg-[#0d0d0d] border border-white/5 rounded-lg flex items-center px-4">
        <input 
          type="text" 
          placeholder={`Message #${channel.name}...`} 
          className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-600"
        />
      </div>
    </div>
  );
}