import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';
import Sidebar from '../components/dashboard/Sidebar';
import FeatureHeader from '../components/dashboard/FeatureHeader';
import ModuleContainer from '../components/dashboard/ModuleContainer';
import TeamManagementModal from './TeamManagementModal';

import { subscribeToChannel, connect } from '../services/websocketService';

export default function WorkspaceDashboard() {
  const { workspaceId, teamId, featureId, channelId } = useParams();
  const navigate = useNavigate();

  // Use actual route params only
  const activeWorkspaceId = teamId || workspaceId;

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

  const currentUserId = data?.currentUserId || data?.userId;

  // Initialize websocket
  useEffect(() => {
    connect(() => {
      console.log('✅ WebSocket engine is online and ready for communication.');
    });
  }, []);

  // Sync navigation state with URL
  useEffect(() => {
    if (featureId) {
      setNav(prev => ({
        ...prev,
        activeFeature: featureId,
        selectedChannel: null
      }));
    } else if (channelId) {
      const fullChannelObject = data?.channels?.find(
        ch => String(ch.id) === String(channelId)
      );

      setNav(prev => ({
        ...prev,
        activeFeature: 'chat',
        selectedChannel: fullChannelObject || { id: channelId }
      }));
    } else {
      setNav(prev => ({
        ...prev,
        activeFeature: 'tasks',
        selectedChannel: null
      }));
    }
  }, [featureId, channelId, data?.channels]);

  // Fetch workspace data
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!activeWorkspaceId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const ws = await safeFetch(`/api/v1/dashboard/workspace/${activeWorkspaceId}`);
        if (!isMounted) return;
        setData(ws);
      } catch (error) {
        console.error('Critical Fetch Error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  // Background listeners for channel notifications
  useEffect(() => {
    if (!data?.channels?.length) return;

    const subscriptions = [];
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    data.channels.forEach(channel => {
      if (!channel?.id) return;

      const sub = subscribeToChannel(channel.id, msg => {
        // Only increment if we aren't actively looking at this channel and we didn't send it
        if (nav.selectedChannel?.id !== channel.id && msg.senderId !== currentUser?.userId) {
          setUnreadCounts(prev => ({
            ...prev,
            [channel.id]: (prev[channel.id] || 0) + 1
          }));
        }
      });

      if (sub) {
        subscriptions.push(sub);
      }
    });

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe?.());
    };
  }, [data?.channels, nav.selectedChannel]);

  if (!activeWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505] text-white">
        No workspace selected.
      </div>
    );
  }

  return (
    <div
      key={activeWorkspaceId}
      className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans"
    >
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
            <div className="text-gray-600 animate-pulse font-mono text-sm">
              Synchronizing workspace components...
            </div>
          ) : (
            <ModuleContainer
              nav={nav}
              workspaceData={data}
            />
          )}
        </div>
      </main>

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        closeModal={() => setIsTeamModalOpen(false)}
        teamId={activeWorkspaceId}
        currentUserId={currentUserId}
      />
    </div>
  );
}