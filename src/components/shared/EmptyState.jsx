import React from 'react';

export default function EmptyState({ icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-white/5 rounded-xl bg-[#080808]">
      {icon && <div className="text-4xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">{title}</h3>
      <p className="text-xs text-gray-600 mt-2 max-w-xs">
        {message}
      </p>
    </div>
  );
}