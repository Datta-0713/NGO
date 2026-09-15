import api from './axios';

export const notificationsApi = {
  broadcastNotification: (title: string, message: string) =>
    api.post('/admin/notifications/broadcast', { title, message }).then(res => res.data),
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }).then(res => res.data),
};