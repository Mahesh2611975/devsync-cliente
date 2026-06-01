import { safeFetch } from '../utils/safeFetch';

const BASE = '/api/v1/tasks';

const req = (method, body) => ({ method, body });  

export const taskService = {
  getByTeam:     (teamId)         => safeFetch(`${BASE}/team/${teamId}`),
  getByStatus:   (teamId, status) => safeFetch(`${BASE}/team/${teamId}/status/${status}`),
  getById:       (taskId)         => safeFetch(`${BASE}/${taskId}`),
  getMyTasks:    (userId)         => safeFetch(`${BASE}/assignee/${userId}`),
  getActivities: (taskId)         => safeFetch(`${BASE}/${taskId}/activities`),
  getComments:   (taskId)         => safeFetch(`${BASE}/${taskId}/comments`),

  create:        (body)           => safeFetch(BASE,                            req('POST',  body)),
  update:        (taskId, body)   => safeFetch(`${BASE}/${taskId}`,             req('PUT',   body)),
  assign:        (taskId, body)   => safeFetch(`${BASE}/${taskId}/assign`,      req('PATCH', body)),
  updateStatus:  (taskId, body)   => safeFetch(`${BASE}/${taskId}/status`,      req('PATCH', body)),
  delete:        (taskId)         => safeFetch(`${BASE}/${taskId}`,             { method: 'DELETE' }),

  addComment:    (taskId, body)   => safeFetch(`${BASE}/${taskId}/comments`,    req('POST',  body)),
  deleteComment: (commentId)      => safeFetch(`${BASE}/comments/${commentId}`, { method: 'DELETE' }),
};