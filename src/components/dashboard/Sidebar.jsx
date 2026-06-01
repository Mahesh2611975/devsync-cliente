import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CreateChannelModal from '../../pages/CreateChannelModal';

const ChatIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
);

const GitHubIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
);

const BugIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
);

const DeploymentIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.63 8.41m5.96 5.96a14.92 14.92 0 0 1-8.96 4.97m9.93-10.93a2.5 2.5 0 1 1-3.54-3.54m3.54 3.54.001-.001a2.5 2.5 0 0 1 0 3.54M9.63 8.41a14.93 14.93 0 0 0-4.97 8.96m4.97-8.96L4.3 14.04m1.11 4.51a6 6 0 0 1-3.13-5.14h4.8" />
  </svg>
);

const CodeIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

const VideoIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 1 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.827m11.379-8.16 1.15-.827M8.14 21.27l.707-1.03m6.307-9.18.706-1.03M12 21.75V21m0-16.5V3m-2.27 18.27-.707-1.03m6.307-9.18-.706-1.03M5.106 6.215l1.15.828m11.379 8.16 1.15-.827M4.5 9.543l1.41.514c.334.122.7.043.953-.2l.002-.001a.75.75 0 0 0 .213-.655l-.117-.853" />
  </svg>
);

// ← NEW
const TaskIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

export default function Sidebar({ data, setData, nav, setNav, setIsTeamModalOpen, unreadCounts, setUnreadCounts }) {
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { workspaceId, teamId, channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isTeamRoute = !!teamId;
  const activeId = workspaceId || teamId || data?.id || 1;
  const activeFeature = nav?.activeFeature || 'overview';

  useEffect(() => {
    const fetchWorkspaceChannels = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:8080/api/channels/workspace/${activeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const channelsList = await res.json();
          if (setData) setData(prev => ({ ...prev, channels: channelsList }));
        }
      } catch (err) {
        console.error(" Error fetching workspace channel layout matrix:", err);
      }
    };
    fetchWorkspaceChannels();
  }, [activeId, setData]);

  useEffect(() => {
    if (!data?.channels || data.channels.length === 0) return;
    if (channelId) {
      const matchedChannel = data.channels.find(c => String(c.id) === String(channelId));
      if (matchedChannel && nav?.selectedChannel?.id !== matchedChannel.id) {
        setNav(prev => ({ ...prev, activeFeature: 'chat', selectedChannel: matchedChannel }));
      }
    }
  }, [channelId, data?.channels]);

  const handleCreateChannel = async (name) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/channels/create?teamId=${activeId}&name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const newChannel = await res.json();
        if (setData) setData(prev => ({ ...prev, channels: [...(prev?.channels || []), newChannel] }));
      }
    } catch (err) {
      console.error("Failed to append workspace communication line:", err);
    }
  };

  const handleSelectChannel = (ch) => {
    if (setUnreadCounts) setUnreadCounts(prev => ({ ...prev, [ch.id]: 0 }));
    setNav({ activeFeature: 'chat', selectedChannel: ch, selectedBugRoom: null, selectedDeployment: null });
    if (isTeamRoute) {
      navigate(`/team/${activeId}/channel/${ch.id}`);
    } else {
      navigate(`/workspace/${activeId}/channel/${ch.id}`);
    }
  };

  const handleSelectFeature = (featureId) => {
    setNav({ activeFeature: featureId, selectedChannel: null, selectedBugRoom: null, selectedDeployment: null });
    if (isTeamRoute) {
      navigate(`/team/${activeId}/feature/${featureId}`);
    } else {
      navigate(`/workspace/${activeId}/feature/${featureId}`);
    }
  };

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-4 bg-[#09090b] shrink-0 select-none">
      <div className="space-y-6 overflow-y-auto pr-1">
        
        {/* Brand Header */}
        <div 
          onClick={() => {
            setNav({ activeFeature: 'overview', selectedChannel: null, selectedBugRoom: null, selectedDeployment: null });
            if (isTeamRoute) { navigate(`/team/${activeId}`); } else { navigate(`/workspace/${activeId}`); }
          }}
          className="flex items-center gap-2 px-2 cursor-pointer group"
        >
          <div className="h-3 w-3 rounded-full bg-[#FF4500] shadow-[0_0_8px_#FF4500]" />
          <h2 className="text-white group-hover:text-[#FF4500] font-black text-xl tracking-wider transition">DevSync</h2>
        </div>

        <div className="space-y-4">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 py-2 text-sm rounded-md transition text-gray-400">
              <div 
                onClick={() => { setChannelsExpanded(!channelsExpanded); setNav(prev => ({ ...prev, activeFeature: 'chat' })); }}
                className={`flex items-center gap-2.5 cursor-pointer grow ${activeFeature === 'chat' ? 'text-[#FF4500]' : 'hover:text-white'}`}
              >
                <ChatIcon className="h-4 w-4 shrink-0" />
                <span className="font-medium">Real-Time Chat</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                className="hover:text-white px-2 font-bold text-base"
              >+</button>
            </div>

            {channelsExpanded && data?.channels && (
              <div className="mt-1 ml-4 border-l border-white/5 pl-2 space-y-0.5">
                {data.channels.map(ch => {
                  const isChSelected = nav?.selectedChannel?.id === ch.id || String(channelId) === String(ch.id);
                  return (
                    <div 
                      key={ch.id}
                      onClick={(e) => { e.stopPropagation(); handleSelectChannel(ch); }}
                      className={`flex justify-between items-center px-2 py-1.5 text-xs rounded cursor-pointer transition ${
                        isChSelected ? 'text-white bg-white/10 font-semibold' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span># {ch.name}</span>
                      {unreadCounts?.[ch.id] > 0 && (
                        <span className="bg-[#FF4500] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCounts[ch.id]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Modules — tasks added between github and bugs */}
          {[
            { id: 'github',      label: 'GitHub Integration',     Icon: GitHubIcon      },
            { id: 'tasks',       label: 'Task Board',             Icon: TaskIcon        },
            { id: 'bugs',        label: 'Bug Tracking Rooms',     Icon: BugIcon         },
            { id: 'deployments', label: 'Deployment Monitoring',  Icon: DeploymentIcon  },
            { id: 'code',        label: 'Live Code Collaboration', Icon: CodeIcon        },
            { id: 'video',       label: 'DevMeet Video',          Icon: VideoIcon       }
          ].map((item) => {
            const ActiveIcon = item.Icon;
            const itemSelected = activeFeature === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => handleSelectFeature(item.id)}
                className={`flex items-center gap-2.5 px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                  itemSelected ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ActiveIcon className={`h-4 w-4 shrink-0 ${itemSelected ? 'text-[#FF4500]' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/5">
        <button 
          onClick={() => setIsTeamModalOpen(true)}
          className="text-left text-xs text-gray-400 hover:text-white flex items-center justify-between group cursor-pointer w-full p-2 rounded-lg hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="h-4 w-4 text-gray-400 group-hover:text-white" />
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