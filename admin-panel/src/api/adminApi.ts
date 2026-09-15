import api from './axios';

/**
 * Admin-scoped API calls.
 * All routes hit /api/admin/* which are guarded by protect + requireAdmin middleware.
 */
export const getDashboardStats = () =>
  api.get('/admin/dashboard/stats').then(res => res.data);

export const broadcastNotification = (title: string, message: string) =>
  api.post('/admin/notifications/broadcast', { title, message }).then(res => res.data);