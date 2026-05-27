import React, { useState } from 'react';
import CreateChannelModal from '../../pages/CreateChannelModal';

export default function Sidebar({ data, setData, nav, setNav, setIsTeamModalOpen, unreadCounts, setUnreadCounts }) {
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to determine if a menu item is active
  const isActive = (feature) => nav.activeFeature === feature;

  const handleCreateChannel = async (name) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/channels/create?teamId=1&name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const newChannel = await res.json();
        setData({ ...data, channels: [...(data.channels || []), newChannel] });
      }
    } catch (err) {
      console.error("Failed to create channel", err);
    }
  };

  const handleSelectChannel = (ch) => {
    // Clear unread count for this channel when clicked
    if (setUnreadCounts) {
      setUnreadCounts(prev => ({ ...prev, [ch.id]: 0 }));
    }
    setNav({ activeFeature: 'chat', selectedChannel: ch });
  };

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-4 bg-[#09090b] shrink-0 select-none">
      <div className="space-y-6 overflow-y-auto pr-1">
        
        {/* Brand */}
        <div 
          onClick={() => setNav({ ...nav, activeFeature: 'overview' })}
          className="flex items-center gap-2 px-2 cursor-pointer group"
        >
          <div className="h-3 w-3 rounded-full bg-[#FF4500] shadow-[0_0_8px_#FF4500]" />
          <h2 className="text-white group-hover:text-[#FF4500] font-black text-xl tracking-wider transition">DevSync</h2>
        </div>

        <div className="space-y-4">
          {/* Chat Section */}
          <div>
            <div className="flex items-center justify-between px-2 py-2 text-sm rounded-md transition text-gray-400">
              <div 
                onClick={() => {
                  setChannelsExpanded(!channelsExpanded);
                  setNav({ ...nav, activeFeature: 'chat' });
                }}
                className={`flex items-center gap-2 cursor-pointer grow ${isActive('chat') ? 'text-[#FF4500]' : 'hover:text-white'}`}
              >
                <span>💬</span>
                <span className="font-medium">Real-Time Chat</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hover:text-white px-2 font-bold"
              >
                +
              </button>
            </div>

            {channelsExpanded && data?.channels && (
              <div className="mt-1 ml-4 border-l border-white/5 pl-2 space-y-0.5">
                {data.channels.map(ch => (
                  <div 
                    key={ch.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChannel(ch);
                    }}
                    className={`flex justify-between items-center px-2 py-1.5 text-xs rounded cursor-pointer transition ${
                      nav.selectedChannel?.id === ch.id ? 'text-white bg-white/10 font-semibold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <span># {ch.name}</span>
                    {unreadCounts?.[ch.id] > 0 && (
                      <span className="bg-[#FF4500] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCounts[ch.id]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Modules */}
          {[
            { id: 'github', label: 'GitHub Integration', icon: '⌥' },
            { id: 'bugs', label: 'Bug Tracking Rooms', icon: '🐛' },
            { id: 'deployments', label: 'Deployment Monitoring', icon: '🚀' },
            { id: 'code', label: 'Live Code Collaboration', icon: '⚡' },
            { id: 'video', label: 'DevMeet Video', icon: '📹' }
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => setNav({ activeFeature: item.id, selectedChannel: null })}
              className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                isActive(item.id) ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/5">
        <button 
          onClick={() => setIsTeamModalOpen(true)}
          className="text-left text-xs text-gray-400 hover:text-white flex items-center justify-between group cursor-pointer w-full p-2 rounded-lg hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2">
            <span>⚙️</span>
            <span>Manage Team Engine</span>
          </div>
        </button>
      </div>

      <CreateChannelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handleCreateChannel} 
      />
    </aside>
  );
}