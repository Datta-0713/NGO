import { api } from './axios';
import type { Notification, ContributorHighlight, ApiResponse } from '../types';

interface NotificationsPage {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

export const notificationsApi = {
  /** GET /api/notifications/mine — paginated notifications for current user */
  getNotifications: async (params: { page: number; limit: number }) => {
    const response = await api.get<ApiResponse<NotificationsPage>>('/notifications/mine', { params });
    return response.data.data; // { notifications, total, page, totalPages }
  },

  /** PATCH /api/notifications/:id/read */
  markRead: async (id: string) => {
    const response = await api.patch<ApiResponse<null>>(`/notifications/${id}/read`);
    return response.data;
  },

  /** PATCH /api/notifications/read-all */
  markAllRead: async () => {
    const response = await api.patch<ApiResponse<null>>('/notifications/read-all');
    return response.data;
  },

  /** GET /api/notifications/unread-count */
  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data; // { count }
  },

  /** GET /api/notifications/highlight */
  getContributorHighlight: async () => {
    const response = await api.get<ApiResponse<{ highlight: ContributorHighlight | null }>>('/notifications/highlight');
    return response.data.data; // { highlight }
  },
};
