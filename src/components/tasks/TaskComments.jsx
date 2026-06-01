import React, { useState } from 'react';
import { taskService } from '../../services/taskService';

export default function TaskComments({ taskId, comments = [], currentUserId, onCommentAdded }) {
  const [content, setContent]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError('');
    try {
      await taskService.addComment(taskId, {
        authorId: currentUserId,
        content: trimmed         
      });
      setContent('');
      onCommentAdded?.();        
    } catch (e) {
      setError('Failed to post comment.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await taskService.deleteComment(commentId);
      onCommentAdded?.();
    } catch (e) {
      console.error('Failed to delete comment:', e);
    }
  };

  return (
    <div className="space-y-3">

      {/* Thread */}
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="text-xs text-gray-600 italic">No comments yet.</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="bg-white/5 border border-white/5 rounded-md p-2.5 group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-[#FF4500]/20 flex items-center justify-center text-[9px] text-[#FF4500] font-bold shrink-0">
                  {String(c.authorId).slice(-2)}
                </div>
                <span className="text-[11px] text-gray-500">
                  #{c.authorId} · {new Date(c.createdAt).toLocaleString([], {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {c.authorId === currentUserId && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-[10px] text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  delete
                </button>
              )}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-7">{c.content}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Write a comment... (Enter to send)"
          disabled={submitting}
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4500]/50 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="text-xs px-3 py-1.5 bg-[#FF4500]/10 text-[#FF4500] rounded-md hover:bg-[#FF4500]/20 transition disabled:opacity-40 shrink-0"
        >
          {submitting ? '...' : 'Send'}
        </button>
      </div>

    </div>
  );
}