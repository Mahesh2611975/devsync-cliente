import React from 'react';
import DevMeetDashboard from '../../pages/devmeet/DevMeetDashboard';
import ChatWindow from '../chat/ChatWindow';
import TaskBoard from '../tasks/TaskBoard';

export default function ModuleContainer({ nav, workspaceData }) {
  const activeFeature = nav?.activeFeature || 'overview';
  const teamId = workspaceData?.id || 1;
  const currentUserId = workspaceData?.currentUserId || workspaceData?.userId || 1;

  if (activeFeature === 'chat' && nav.selectedChannel) {
    return <ChatWindow channel={nav.selectedChannel} />;
  }

  switch (activeFeature) {
    case 'overview':     return <div className="text-white p-8">Overview</div>;
    case 'github':       return <div className="text-white p-8">GitHub Integration</div>;
    case 'bugs':         return <div className="text-white p-8">Bug Tracking</div>;
    case 'deployments':  return <div className="text-white p-8">Deployments</div>;
    case 'code':         return <div className="text-white p-8">Live Code Collaboration</div>;
    case 'video':        return <DevMeetDashboard teamId={teamId} />;
    case 'tasks':        return <TaskBoard teamId={teamId} currentUserId={currentUserId} />;
    case 'chat':         return <div className="text-white p-8">Select a channel from the sidebar.</div>;
    default:             return <div className="text-white p-8">Overview</div>;
  }
}