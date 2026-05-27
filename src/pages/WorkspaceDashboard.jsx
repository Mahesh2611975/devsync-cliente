import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';
import TeamManagementModal from './TeamManagementModal'; 

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  
  // Controls the current clickable dashboard layout module
  const [activeFeature, setActiveFeature] = useState('overview');
  const [channelsExpanded, setChannelsExpanded] = useState(false);

  const currentUserId = data?.currentUserId || data?.userId || 1; 

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const ws = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}`);
        if (!isMounted) return;
        setData(ws);

        try {
          const reqs = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}/pending-approvals`);
          if (isMounted) setPending(reqs?.pendingRequests || reqs || []);
        } catch (err) {
          console.warn("Pending approvals restricted or unavailable:", err.message);
          if (isMounted) setPending([]);
        }
      } catch (e) {
        console.error("Critical Fetch Error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [workspaceId]);

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-4 bg-[#09090b] shrink-0 select-none">
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* Logo Brand / Workspace Home */}
          <div 
            onClick={() => setActiveFeature('overview')}
            className="flex items-center gap-2 px-2 cursor-pointer group"
          >
            <div className="h-3 w-3 rounded-full bg-[#FF4500] shadow-[0_0_8px_#FF4500]" />
            <h2 className="text-white group-hover:text-[#FF4500] font-black text-xl tracking-wider transition">DevSync</h2>
            <span className="text-[9px] bg-white/10 text-gray-400 px-1 rounded ml-auto font-mono">v1.0</span>
          </div>

          <div className="space-y-4">
            
            {/* 1. Real-Time Chat (Channels) */}
            <div>
              <div 
                onClick={() => {
                  setChannelsExpanded(!channelsExpanded);
                  setActiveFeature('chat');
                }}
                className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                  activeFeature === 'chat' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span className="font-medium">Real-Time Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
                    className={`transition-transform duration-150 ${channelsExpanded ? 'rotate-90' : ''}`}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Collapsible Inner Channels */}
              {channelsExpanded && data?.channels && (
                <div className="mt-1 ml-4 border-l border-white/5 pl-2 space-y-0.5">
                  {data.channels.map(ch => (
                    <div 
                      key={ch.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFeature(`chat-${ch.name}`);
                      }}
                      className={`px-2 py-1.5 text-xs rounded cursor-pointer transition ${
                        activeFeature === `chat-${ch.name}` ? 'text-[#FF4500] bg-white/5 font-semibold' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      # {ch.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. GitHub Integration */}
            <div 
              onClick={() => setActiveFeature('github')}
              className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                activeFeature === 'github' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⌥</span>
                <span className="font-medium">GitHub Integration</span>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* 3. Bug Tracking Rooms */}
            <div 
              onClick={() => setActiveFeature('bugs')}
              className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                activeFeature === 'bugs' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🐛</span>
                <span className="font-medium">Bug Tracking Rooms</span>
              </div>
            </div>

            {/* 4. Deployment Monitoring */}
            <div 
              onClick={() => setActiveFeature('deployments')}
              className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                activeFeature === 'deployments' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🚀</span>
                <span className="font-medium">Deployment Monitoring</span>
              </div>
            </div>

            {/* 5. Live Code Collaboration */}
            <div 
              onClick={() => setActiveFeature('code')}
              className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                activeFeature === 'code' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="font-medium">Live Code Collaboration</span>
              </div>
            </div>

            {/* 6. DevMeet Video */}
            <div 
              onClick={() => setActiveFeature('video')}
              className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition ${
                activeFeature === 'video' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📹</span>
                <span className="font-medium">DevMeet Video</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Settings Area */}
        <div className="pt-2 border-t border-white/5">
          <button 
            onClick={() => setIsTeamModalOpen(true)}
            className="text-left text-xs text-gray-400 hover:text-white flex items-center justify-between group cursor-pointer w-full p-2 rounded-lg hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <span>⚙️</span>
              <span>Manage Team Engine</span>
            </div>
            {pending.length > 0 && (
              <span className="bg-[#FF4500] text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">{pending.length}</span>
            )}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT MODULE VIEWPORT ================= */}
      <main className="flex-1 flex flex-col bg-[#050505] overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-[#080808] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-[#FF4500] font-mono tracking-wider">[Module View]</span>
            <h1 className="text-sm font-bold tracking-wide text-gray-200 capitalize">
              {activeFeature.replace('-', ' ')}
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            STOMP Broker Connected
          </div>
        </header>

        {/* Content Panel Box */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="text-gray-600 animate-pulse text-sm font-mono">Synchronizing workspace components...</div>
          ) : (
            <div className="max-w-3xl space-y-6">
              
              {/* VIEW: OVERVIEW / CORE DASHBOARD */}
              {activeFeature === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-[#FF4500] font-bold uppercase tracking-widest mb-1">{data?.formattedDate}</p>
                    <h2 className="text-3xl font-black">{data?.workspace?.name || "DevSync Core Terminal"}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      DevSync replaces 5 separate tools (Slack + GitHub + Jira + Zoom + CodeSandbox) with one unified platform built specifically for developer teams. Everything talks to everything else.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0d0d0d] border border-white/5 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Active Members</p>
                      <p className="text-2xl font-bold mt-1 text-white">{data?.totalMembers ?? 0}</p>
                    </div>
                    <div className="p-4 bg-[#0d0d0d] border border-white/5 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Workspace Channels</p>
                      <p className="text-2xl font-bold mt-1 text-white">{data?.totalChannels ?? 0}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-[#0a0a0c] border border-white/5 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Underpinnings</p>
                    <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                      <li>Centralized WebSocket architecture via a singular STOMP broker.</li>
                      <li>Redis presence user state managed with a 30-second heartbeat check.</li>
                      <li>Layered authentication via JWT access & refresh token rotation matrices.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* VIEW: CHAT OR SUB-CHANNEL */}
              {activeFeature.startsWith('chat') && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">Real-Time Chat Backbone</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Channel-based messaging featuring direct messages, live typing indicators, read receipts, and native code snippet sharing with built-in syntax highlighting.
                    </p>
                  </div>
                  <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-600 font-mono">
                    [ WebSocket Channel Pipeline Open: {activeFeature} ]
                  </div>
                </div>
              )}

              {/* VIEW: GITHUB */}
              {activeFeature === 'github' && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">Deep GitHub Automation Integration</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Webhooks directly map repository push events, PR interactions, and issue actions straight into your context-relevant channels.
                    </p>
                  </div>
                  <div className="p-4 bg-[#0e0e11] border border-purple-500/10 rounded-xl text-xs font-mono text-purple-400">
                    STATUS: Webhook listening for structural repository events.
                  </div>
                </div>
              )}

              {/* VIEW: BUGS */}
              {activeFeature === 'bugs' && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">Bug Tracking Rooms</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Every ticket functions as an isolated live conversation room. The team debugs together, attaches stack traces/logs, links fix commits, and changes state records asynchronously.
                    </p>
                  </div>
                  <div className="p-4 bg-rose-950/20 text-rose-400 border border-rose-950/50 rounded-xl text-xs font-mono">
                    WebSocket-backed persistent state enabled per isolated ticket room.
                  </div>
                </div>
              )}

              {/* VIEW: DEPLOYMENTS */}
              {activeFeature === 'deployments' && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">Continuous Deployment Monitoring</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Binds CI/CD telemetry directly from GitHub Actions or Jenkins workflows. Production status changes broadcast in absolute real-time.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: CODE COLLABORATION */}
              {activeFeature === 'code' && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">Live Shared Code Workspace</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Integrated Monaco Code Editor module sharing operations in absolute real-time, providing explicit cursor tracking per active session participant.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: DEVMEET VIDEO */}
              {activeFeature === 'video' && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">DevMeet WebRTC Video Rooms</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Scoped end-to-end channel meeting spaces powered natively by WebRTC infrastructure. No external links, invitation tokens, or third-party client handshakes.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </main>

      {/* Team Management Modal Control */}
      <TeamManagementModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        teamId={workspaceId} 
        currentUserId={currentUserId}
      />
    </div>
  );
}