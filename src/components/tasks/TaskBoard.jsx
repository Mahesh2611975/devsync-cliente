import React, { useState } from 'react';
import { useTask } from '../../hooks/useTask';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];

const LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled'
};

const COLORS = {
  TODO: 'text-gray-400',
  IN_PROGRESS: 'text-blue-400',
  IN_REVIEW: 'text-yellow-400',
  DONE: 'text-green-400',
  CANCELLED: 'text-red-400'
};

export default function TaskBoard({ teamId, currentUserId }) {

  console.log('========================');
  console.log('TASK BOARD');
  console.log('teamId:', teamId);
  console.log('currentUserId:', currentUserId);
  console.log('========================');

  const {
    tasks,
    loading,
    selected,
    setSelected,
    openTask,
    createTask,
    updateStatus,
    assign,
    deleteTask,
    refreshSelected
  } = useTask(teamId);

  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="text-gray-500 animate-pulse font-mono text-sm p-8">
        Loading task board...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-2">

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-white font-bold text-lg">
            Task Board
          </h2>

          <p className="text-xs text-gray-600 mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · Team #{teamId}
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="text-sm px-3 py-1.5 rounded-md bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 transition font-medium"
        >
          + New Task
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 flex-1 items-start">
        {COLUMNS.map(status => {
          const col = tasks.filter(t => t.status === status);

          return (
            <div
              key={status}
              className="min-w-[210px] w-[210px] flex flex-col gap-2 shrink-0"
            >
              <div className="flex items-center gap-2 px-1 mb-1">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${COLORS[status]}`}
                >
                  {LABELS[status]}
                </span>

                <span className="text-[11px] text-gray-600">
                  ({col.length})
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {col.length === 0 && (
                  <div className="border border-dashed border-white/5 rounded-lg h-16 flex items-center justify-center">
                    <span className="text-[11px] text-gray-700">
                      empty
                    </span>
                  </div>
                )}

                {col.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => openTask(task.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <TaskDetail
          task={selected}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onStatusChange={(status) =>
            updateStatus(selected.id, status, currentUserId)
          }
          onAssign={(assigneeId) =>
            assign(selected.id, assigneeId, currentUserId)
          }
          onComment={() => refreshSelected(selected.id)}
          onDelete={() => deleteTask(selected.id)}
        />
      )}

      {showForm && (
        <TaskForm
          teamId={teamId}
          reporterId={currentUserId}
          onClose={() => setShowForm(false)}
          onSubmit={async body => {
            console.log('TASK CREATE BODY:', body);

            await createTask(body);

            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}