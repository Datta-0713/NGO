import api from './axios';

export const notificationsApi = {
  broadcastNotification: (title: string, message: string) =>
    api.post('/admin/notifications/broadcast', { title, message }).then(res => res.data),
};