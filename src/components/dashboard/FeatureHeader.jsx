import React from 'react';

export default function FeatureHeader({ activeFeature }) {
  // Map feature IDs to readable titles
  const titles = {
    overview: 'Workspace Overview',
    chat: 'Real-Time Chat',
    github: 'GitHub Integration',
    bugs: 'Bug Tracking Rooms',
    deployments: 'Deployment Monitoring',
    code: 'Live Code Collaboration',
    video: 'DevMeet Video'
  };

  return (
    <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-[#080808] shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase text-[#FF4500] font-mono tracking-wider">[Active Module]</span>
        <h1 className="text-sm font-bold tracking-wide text-gray-200 capitalize">
          {titles[activeFeature] || activeFeature}
        </h1>
      </div>
      <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
        System Ready
      </div>
    </header>
  );
}