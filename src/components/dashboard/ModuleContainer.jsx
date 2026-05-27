import React from 'react';
import ChatWindow from '../chat/ChatWindow';
import EmptyState from '../shared/EmptyState';

export default function ModuleContainer({ nav, workspaceData }) {
  switch (nav.activeFeature) {
    case 'chat': return <ChatWindow channel={nav.selectedChannel} />;
    default: return <EmptyState icon="🚀" title="Dashboard" message="Select a feature." />;
  }
}