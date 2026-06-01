import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';

export function useTask(teamId) {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(null);

  const loadTasks = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const data = await taskService.getByTeam(teamId);
      setTasks(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const refreshSelected = useCallback(async (taskId) => {
    try {
      const fresh = await taskService.getById(taskId);
      setSelected(fresh);
    } catch (e) {
      console.error('Failed to refresh task:', e);
    }
  }, []);

  const openTask = async (taskId) => {
    try {
      const data = await taskService.getById(taskId);
      setSelected(data);
    } catch (e) {
      console.error('Failed to open task:', e);
    }
  };

  const createTask = async (body) => {
    await taskService.create(body);
    await loadTasks();
  };

  const updateStatus = async (taskId, status, actorId) => {
    await taskService.updateStatus(taskId, { status, actorId });
    await loadTasks();
    await refreshSelected(taskId);
  };

  const assign = async (taskId, assigneeId, actorId) => {
    await taskService.assign(taskId, { assigneeId, actorId });
    await loadTasks();
    await refreshSelected(taskId);
  };

  const addComment = async (taskId, authorId, content) => {
    await taskService.addComment(taskId, { authorId, content });
    await refreshSelected(taskId);
  };

  const deleteTask = async (taskId) => {
    await taskService.delete(taskId);
    setSelected(null);
    await loadTasks();
  };

  return {
    tasks, loading, error, selected, setSelected,
    loadTasks, openTask, createTask, updateStatus, assign, addComment, deleteTask
  };
}