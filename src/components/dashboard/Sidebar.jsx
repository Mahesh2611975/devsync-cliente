import React, { useState } from 'react';

export default function Sidebar({ data, nav, setNav, setIsTeamModalOpen }) {
  const [channelsExpanded, setChannelsExpanded] = useState(true);

  // Helper to determine if a menu item is active
  const isActive = (feature) => nav.activeFeature === feature;

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
            <div 
              onClick={() => {
                setChannelsExpanded(!channelsExpanded);
                setNav({ ...nav, activeFeature: 'chat' });
              }}
              className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                isActive('chat') ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span className="font-medium">Real-Time Chat</span>
              </div>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
                className={`transition-transform duration-150 ${channelsExpanded ? 'rotate-90' : ''}`}>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {channelsExpanded && data?.channels && (
              <div className="mt-1 ml-4 border-l border-white/5 pl-2 space-y-0.5">
                {data.channels.map(ch => (
                  <div 
                    key={ch.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNav({ activeFeature: 'chat', selectedChannel: ch });
                    }}
                    className={`px-2 py-1.5 text-xs rounded cursor-pointer transition ${
                      nav.selectedChannel?.id === ch.id ? 'text-[#FF4500] bg-white/5 font-semibold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    # {ch.name}
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
    </aside>
  );
}