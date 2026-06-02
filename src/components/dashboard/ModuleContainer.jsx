import React from 'react';
import DevMeetDashboard from '../../pages/devmeet/DevMeetDashboard';
import ChatWindow from '../chat/ChatWindow';
import TaskBoard from '../tasks/TaskBoard';

export default function ModuleContainer({ nav, workspaceData }) {
  const activeFeature = nav?.activeFeature || 'tasks';

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const teamId =
    workspaceData?.workspace?.id ||
    workspaceData?.workspace?.teamId;

  const currentUserId = currentUser?.userId;

  console.log('========================');
  console.log('MODULE CONTAINER');
  console.log('workspaceData:', workspaceData);
  console.log('workspace:', workspaceData?.workspace);
  console.log('teamId:', teamId);
  console.log('currentUserId:', currentUserId);
  console.log('activeFeature:', activeFeature);
  console.log('========================');

  if (activeFeature === 'chat' && nav?.selectedChannel) {
    return (
      <ChatWindow
        channel={nav.selectedChannel}
      />
    );
  }

  const taskBoard = (
    <TaskBoard
      teamId={teamId}
      currentUserId={currentUserId}
    />
  );

  switch (activeFeature) {
    case 'tasks':
      return taskBoard;

    case 'github':
      return (
        <div className="text-white p-8">
          GitHub Integration
        </div>
      );

    case 'bugs':
      return (
        <div className="text-white p-8">
          Bug Tracking Rooms
        </div>
      );

    case 'deployments':
      return (
        <div className="text-white p-8">
          Deployment Monitoring
        </div>
      );

    case 'code':
      return (
        <div className="text-white p-8">
          Live Code Collaboration
        </div>
      );

    case 'video':
      return (
        <DevMeetDashboard
          teamId={teamId}
        />
      );

    case 'chat':
      return (
        <div className="text-white p-8">
          Select a channel from the sidebar.
        </div>
      );

    case 'overview':
      return taskBoard;

    default:
      return taskBoard;
  }
}