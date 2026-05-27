import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';
import Sidebar from '../components/dashboard/Sidebar';
import FeatureHeader from '../components/dashboard/FeatureHeader';
import ModuleContainer from '../components/dashboard/ModuleContainer';
import TeamManagementModal from './TeamManagementModal';

// Ensure this path matches where your websocket service is located
import { subscribeToChannel } from '../services/websocketService'; 

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  
  // NEW: State to track unread messages globally
  const [unreadCounts, setUnreadCounts] = useState({});
  
  // Clean, scalable state
  const [nav, setNav] = useState({
    activeFeature: 'overview',
    selectedChannel: null,
    selectedBugRoom: null,
    selectedDeployment: null
  });

  const currentUserId = data?.currentUserId || data?.userId || 1;

  // 1. Fetch initial workspace data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const ws = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}`);
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
  }, [workspaceId]);

  // 2. NEW: Background listener for all channels to track unread counts
  useEffect(() => {
    if (!data?.channels) return;

    const subscriptions = [];

    // Loop through all channels in this workspace and listen to them
    data.channels.forEach(channel => {
      const sub = subscribeToChannel(channel.id, (msg) => {
        // If a message arrives for a channel we are NOT currently looking at
        if (nav.selectedChannel?.id !== channel.id) {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          
          // Make sure we didn't send the message ourselves
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

    // Cleanup subscriptions when component unmounts or active channel changes
    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
    };
  }, [data?.channels, nav.selectedChannel]); // Re-run when channels or active view changes

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar 
        data={data} 
        nav={nav} 
        setNav={setNav} 
        setIsTeamModalOpen={setIsTeamModalOpen} 
        pending={pending}
        unreadCounts={unreadCounts}       // Passed down to display badges
        setUnreadCounts={setUnreadCounts} // Passed down so Sidebar can reset counts on click
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
        teamId={workspaceId} 
        currentUserId={currentUserId}
      />
    </div>
  );
}