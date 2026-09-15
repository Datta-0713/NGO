import api from './axios';

/**
 * Users API — admin reads all users, regular routes for profile.
 */
export const getUsers = (params: { page?: number; limit?: number; search?: string }) =>
  api.get('/admin/users', { params }).then(res => res.data);

export const getUserById = (id: string) =>
  api.get(`/admin/users/${id}`).then(res => res.data);