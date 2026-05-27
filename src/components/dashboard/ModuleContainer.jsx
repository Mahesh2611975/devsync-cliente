import React from 'react';
import ChatWindow from '../chat/ChatWindow';
import EmptyState from '../shared/EmptyState';

export default function ModuleContainer({ nav, workspaceData }) {
  const { activeFeature, selectedChannel } = nav;

  // Render logic based on the active feature
  switch (activeFeature) {
    case 'chat':
      return <ChatWindow channel={selectedChannel} />;
      
    case 'github':
      return <EmptyState icon="⌥" title="GitHub" message="Integration dashboard loading..." />;
      
    case 'bugs':
      return <EmptyState icon="🐛" title="Bug Tracker" message="Select a room to begin debugging." />;
      
    case 'deployments':
      return <EmptyState icon="🚀" title="Deployments" message="No active deployment telemetry." />;

    case 'overview':
    default:
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-black">Welcome, {workspaceData?.workspace?.name}</h2>
          <p className="text-gray-400">Select a module from the sidebar to get started.</p>
        </div>
      );
  }
}