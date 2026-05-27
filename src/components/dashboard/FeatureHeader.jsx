import React from 'react';
export default function FeatureHeader({ activeFeature }) {
  return (
    <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-[#080808]">
      <h1 className="text-sm font-bold capitalize text-gray-200">{activeFeature}</h1>
    </header>
  );
}