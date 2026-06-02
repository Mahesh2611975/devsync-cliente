import React, { useState } from 'react';
import TaskComments from './TaskComments';

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];

const PRIORITY_COLOR = {
  LOW:      'text-gray-400',
  MEDIUM:   'text-blue-400',
  HIGH:     'text-yellow-400',
  CRITICAL: 'text-red-400'
};

const PRIORITY_BG = {
  LOW:      'bg-gray-400/10',
  MEDIUM:   'bg-blue-400/10',
  HIGH:     'bg-yellow-400/10',
  CRITICAL: 'bg-red-400/10'
};

const STATUS_COLOR = {
  TODO:        'text-gray-400',
  IN_PROGRESS: 'text-blue-400',
  IN_REVIEW:   'text-yellow-400',
  DONE:        'text-green-400',
  CANCELLED:   'text-red-400'
};

export default function TaskDetail({
  task,
  currentUserId,
  onClose,
  onStatusChange,
  onAssign,
  onComment,
  onDelete
}) {
  const [assignInput, setAssignInput] = useState('');
  const [showAssign, setShowAssign]   = useState(false);
  const [assigning, setAssigning]     = useState(false);
  const [assignError, setAssignError] = useState('');
  const [statusLoading, setStatusLoading] = useState(null); // which status is pending

  const handleStatusChange = async (s) => {
    if (s === task.status) return;
    setStatusLoading(s);
    try {
      await onStatusChange(s);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleAssign = async () => {
    const id = Number(assignInput);
    if (!id) { setAssignError('Enter a valid user ID'); return; }
    setAssigning(true);
    setAssignError('');
    try {
      await onAssign(id);
      setAssignInput('');
      setShowAssign(false);
    } catch (e) {
      setAssignError('Failed to assign. Check the user ID.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <div
        className="w-[480px] h-full bg-[#0f0f0f] border-l border-white/10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-gray-600">TASK #{task.id} · TEAM #{task.teamId}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_BG[task.priority]} ${PRIORITY_COLOR[task.priority]}`}>
                {task.priority}
              </span>
            </div>
            <h3 className="text-white font-semibold text-base leading-snug">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg leading-none shrink-0 mt-1"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Status pills */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => {
                const isActive  = task.status === s;
                const isPending = statusLoading === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={!!statusLoading}
                    className={`text-xs px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 disabled:cursor-wait ${
                      isActive
                        ? `border-[#FF4500] text-[#FF4500] bg-[#FF4500]/10`
                        : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {isPending && (
                      <span className="h-2 w-2 rounded-full border border-current border-t-transparent animate-spin" />
                    )}
                    {s.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta details */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Details</p>
            <div className="bg-white/5 rounded-lg border border-white/5 p-3 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">

              <div>
                <p className="text-gray-500 mb-0.5">Priority</p>
                <p className={`font-medium ${PRIORITY_COLOR[task.priority] ?? 'text-white'}`}>
                  {task.priority}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-0.5">Current Status</p>
                <p className={`font-medium ${STATUS_COLOR[task.status] ?? 'text-white'}`}>
                  {task.status?.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-0.5">Due Date</p>
                <p className="text-white">{task.dueDate ?? '—'}</p>
              </div>

              <div>
                <p className="text-gray-500 mb-0.5">Reporter</p>
                <p className="text-white">#{task.reporterId}</p>
              </div>

              {/* Assignee with inline reassign */}
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Assignee</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {task.assigneeId ? (
                    <span className="text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      User #{task.assigneeId}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Unassigned</span>
                  )}
                  <button
                    onClick={() => { setShowAssign(v => !v); setAssignError(''); setAssignInput(''); }}
                    className="text-[10px] text-[#FF4500] hover:underline"
                  >
                    {showAssign ? 'cancel' : task.assigneeId ? 'reassign' : '+ assign'}
                  </button>
                </div>

                {showAssign && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="number"
                        value={assignInput}
                        onChange={e => setAssignInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAssign(); }}
                        placeholder="Enter User ID"
                        className="w-32 bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4500]/50"
                      />
                      <button
                        onClick={handleAssign}
                        disabled={assigning || !assignInput}
                        className="text-xs px-3 py-1.5 bg-[#FF4500]/10 text-[#FF4500] rounded hover:bg-[#FF4500]/20 transition disabled:opacity-40 flex items-center gap-1.5"
                      >
                        {assigning && (
                          <span className="h-2 w-2 rounded-full border border-current border-t-transparent animate-spin" />
                        )}
                        {assigning ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                    {assignError && (
                      <p className="text-[11px] text-red-400">{assignError}</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-gray-300 leading-relaxed bg-white/5 rounded-lg p-3 border border-white/5 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Comments — TaskComments calls the API itself */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Comments</p>
            <TaskComments
              taskId={task.id}
              comments={task.comments ?? []}
              currentUserId={currentUserId}
              onCommentAdded={() => onComment()}
            />
          </div>

          {/* Activity log — straight from backend */}
          {task.activities?.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Activity</p>
              <div className="space-y-2.5">
                {task.activities.map(a => (
                  <div key={a.id} className="flex items-start gap-2.5 text-[11px]">
                    <div className="h-5 w-5 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center text-[9px] text-[#FF4500] font-bold shrink-0 mt-0.5">
                      {String(a.actorId).slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-400 font-medium">
                        #{a.actorId}
                      </span>
                      <span className="text-gray-500 ml-1">
                        {a.action.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      {a.oldValue && (
                        <span className="text-gray-600 line-through ml-1 truncate">
                          {a.oldValue}
                        </span>
                      )}
                      {a.newValue && (
                        <span className="text-gray-300 ml-1 truncate">
                          → {a.newValue}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-700 text-[10px] shrink-0 mt-0.5">
                      {new Date(a.createdAt).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-white/10 shrink-0 flex items-center justify-between">
          <p className="text-[10px] text-gray-700">
            Created {new Date(task.createdAt).toLocaleDateString([], {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span className="ml-2">
                · Updated {new Date(task.updatedAt).toLocaleDateString([], {
                  month: 'short', day: 'numeric'
                })}
              </span>
            )}
          </p>
          <button
            onClick={onDelete}
            className="text-xs text-red-500/50 hover:text-red-400 transition"
          >
            Delete task
          </button>
        </div>

      </div>
    </div>
  );
}