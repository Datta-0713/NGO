import api from './axios';

export const getUsers = (params: { page?: number; limit?: number; search?: string; role?: 'user' | 'admin'; status?: 'active' | 'inactive' }) =>
  api.get('/admin/users', { params }).then(res => res.data);

export const getUserById = (id: string) =>
  api.get(`/admin/users/${id}`).then(res => res.data);

export const updateUserStatus = (id: string, isActive: boolean) =>
  api.patch(`/admin/users/${id}/status`, { isActive }).then(res => res.data);

export const updateUserNotes = (id: string, adminNotes: string) =>
  api.patch(`/admin/users/${id}/notes`, { adminNotes }).then(res => res.data);
