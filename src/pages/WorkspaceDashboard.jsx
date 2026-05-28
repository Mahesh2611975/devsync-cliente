import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';
import Sidebar from '../components/dashboard/Sidebar';
import FeatureHeader from '../components/dashboard/FeatureHeader';
import ModuleContainer from '../components/dashboard/ModuleContainer';
import TeamManagementModal from './TeamManagementModal';

// Ensure this path matches where your websocket service is located
import { subscribeToChannel } from '../services/websocketService'; 

export default function WorkspaceDashboard() {
  const { workspaceId, teamId, featureId, channelId } = useParams();
  const navigate = useNavigate();

  // Normalize parameter resolution to support /team/:teamId layout mapping safely
  const activeWorkspaceId = teamId || workspaceId || "1";

  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  // Clean, scalable layout state tracked explicitly with dynamic router parameters
  const [nav, setNav] = useState({
    activeFeature: featureId || (channelId ? 'chat' : 'overview'),
    selectedChannel: channelId ? { id: channelId } : null,
    selectedBugRoom: null,
    selectedDeployment: null
  });

  const currentUserId = data?.currentUserId || data?.userId || 1;

  // Sync internal layout state changes directly with explicit React Router updates
  useEffect(() => {
    if (featureId) {
      setNav(prev => ({ 
        ...prev, 
        activeFeature: featureId, 
        selectedChannel: null,
        selectedBugRoom: null,
        selectedDeployment: null 
      }));
    } else if (channelId) {
      setNav(prev => ({ 
        ...prev, 
        activeFeature: 'chat', 
        selectedChannel: { id: channelId },
        selectedBugRoom: null,
        selectedDeployment: null
      }));
    } else {
      setNav(prev => ({
        ...prev,
        activeFeature: 'overview',
        selectedChannel: null,
        selectedBugRoom: null,
        selectedDeployment: null
      }));
    }
  }, [featureId, channelId]);

  // 1. Fetch initial workspace data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!activeWorkspaceId) return;
      setLoading(true);
      try {
        // Pointing to your unified team/workspace engine endpoint
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

  // 2. Background listener for all channels to track unread counts
  useEffect(() => {
    if (!data?.channels) return;

    const subscriptions = [];

    data.channels.forEach(channel => {
      // Defensive check: skip subscription if channel lacks a valid database ID
      if (!channel || !channel.id) return;

      const sub = subscribeToChannel(channel.id, (msg) => {
        if (nav.selectedChannel?.id !== channel.id) {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          
          if (msg.senderId !== currentUser?.userId) {
            setUnreadCounts(prev => ({
              ...prev,
              [channel.id]: (prev[channel.id] || 0) + 1
            }));
          }
        }
      });
      
      if (sub) subscriptions.push(sub);
    });

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
    };
  }, [data?.channels, nav.selectedChannel]);

  return (
    // Adding a unique key to the outer grid root forces React to cleanly 
    // unmount/remount views when switching workspaces, completely clearing key collisions like 'freq-1'
    <div key={activeWorkspaceId} className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar 
        data={data} 
        setData={setData}
        nav={nav} 
        setNav={setNav} 
        setIsTeamModalOpen={setIsTeamModalOpen} 
        pending={pending}
        unreadCounts={unreadCounts}       
        setUnreadCounts={setUnreadCounts} 
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
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        teamId={activeWorkspaceId} 
        currentUserId={currentUserId}
      />
    </div>
  );
}