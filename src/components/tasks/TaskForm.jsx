import React, { useState } from 'react';

export default function TaskForm({ teamId, reporterId, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 w-[420px] space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold">New Task</h3>

        <input
          placeholder="Title *"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4500]/50"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4500]/50 resize-none"
        />
        <div className="flex gap-3">
          <select
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF4500]/50"
          >
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF4500]/50"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 text-sm py-2 rounded-md border border-white/10 text-gray-400 hover:text-white transition">
            Cancel
          </button>
          <button
            disabled={!form.title.trim()}
            onClick={() => onSubmit({ ...form, teamId, reporterId, dueDate: form.dueDate || undefined })}
            className="flex-1 text-sm py-2 rounded-md bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 transition disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}