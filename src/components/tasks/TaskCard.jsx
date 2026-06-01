import React from 'react';

const PRIORITY_COLOR = { LOW: 'text-gray-400', MEDIUM: 'text-blue-400', HIGH: 'text-yellow-400', CRITICAL: 'text-red-400' };
const PRIORITY_DOT   = { LOW: 'bg-gray-400',   MEDIUM: 'bg-blue-400',   HIGH: 'bg-yellow-400',   CRITICAL: 'bg-red-400' };

export default function TaskCard({ task, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-[#FF4500]/40 hover:bg-white/8 transition group"
    >
      <p className="text-white text-sm font-medium leading-snug group-hover:text-[#FF4500] transition line-clamp-2">
        {task.title}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
          <span className={`text-[10px] font-medium ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
        </div>
        {task.assigneeId && (
          <span className="text-[10px] text-gray-500">#{task.assigneeId}</span>
        )}
      </div>
      {task.dueDate && (
        <p className="text-[10px] text-gray-600 mt-1">{task.dueDate}</p>
      )}
    </div>
  );
}