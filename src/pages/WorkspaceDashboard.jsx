import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';
import Sidebar from '../components/dashboard/Sidebar';
import FeatureHeader from '../components/dashboard/FeatureHeader';
import ModuleContainer from '../components/dashboard/ModuleContainer';
import TeamManagementModal from './TeamManagementModal';

// Import the connect function alongside your subscription logic
import { subscribeToChannel, connect } from '../services/websocketService'; 

export default function WorkspaceDashboard() {
  const { workspaceId, teamId, featureId, channelId } = useParams();
  const navigate = useNavigate();

  const activeWorkspaceId = teamId || workspaceId || "1";

  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const [nav, setNav] = useState({
    activeFeature: featureId || (channelId ? 'chat' : 'tasks'),
    selectedChannel: null,
    selectedBugRoom: null,
    selectedDeployment: null
  });

  const currentUserId = data?.currentUserId || data?.userId || 1;

  // 0. INITIALIZE WEBSOCKET CONNECTION
  useEffect(() => {
    connect(() => {
      console.log("✅ WebSocket engine is online and ready for communication.");
    });
  }, []);

  // Sync internal layout state
  useEffect(() => {
    if (featureId) {
      setNav(prev => ({ ...prev, activeFeature: featureId, selectedChannel: null }));
    } else if (channelId) {
      const fullChannelObject = data?.channels?.find(ch => String(ch.id) === String(channelId));
      setNav(prev => ({ 
        ...prev, 
        activeFeature: 'chat', 
        selectedChannel: fullChannelObject || { id: channelId }
      }));
    } else {
      setNav(prev => ({ ...prev, activeFeature: 'overview', selectedChannel: null }));
    }
  }, [featureId, channelId, data?.channels]);

  // 1. Fetch initial workspace data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!activeWorkspaceId) return;
      setLoading(true);
      try {
        const ws = await safeFetch(`/api/v1/dashboard/workspace/${activeWorkspaceId}`);
        if (!isMounted) return;
        setData(ws);
      } catch (e) {
        console.error("Critical Fetch Error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [activeWorkspaceId]);

  // 2. Background listener for all channels
  useEffect(() => {
    if (!data?.channels) return;
    const subscriptions = [];
    data.channels.forEach(channel => {
      if (!channel || !channel.id) return;
      const sub = subscribeToChannel(channel.id, (msg) => {
        if (nav.selectedChannel?.id !== channel.id) {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          if (msg.senderId !== currentUser?.userId) {
            setUnreadCounts(prev => ({ ...prev, [channel.id]: (prev[channel.id] || 0) + 1 }));
          }
        }
      });
      if (sub) subscriptions.push(sub);
    });
    return () => { subscriptions.forEach(sub => sub?.unsubscribe?.()); };
  }, [data?.channels, nav.selectedChannel]);

  return (
    <div key={activeWorkspaceId} className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar 
        data={data} setData={setData} nav={nav} setNav={setNav} 
        setIsTeamModalOpen={setIsTeamModalOpen} pending={pending}
        unreadCounts={unreadCounts} setUnreadCounts={setUnreadCounts} 
      />
      <main className="flex-1 flex flex-col bg-[#050505] overflow-y-auto">
        <FeatureHeader activeFeature={nav.activeFeature} />
        <div className="flex-1 p-8">
          {loading ? (
            <div className="text-gray-600 animate-pulse font-mono text-sm">Synchronizing workspace components...</div>
          ) : (
            <ModuleContainer nav={nav} workspaceData={data} />
          )}
        </div>
      </main>
      <TeamManagementModal 
        isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} 
        teamId={activeWorkspaceId} currentUserId={currentUserId}
      />
    </div>
  );
}