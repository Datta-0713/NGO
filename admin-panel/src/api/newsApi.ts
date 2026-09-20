import api from './axios';

export const getFeed = (params: { page?: number; limit?: number; category?: string; search?: string }) =>
  api.get('/news', { params }).then(res => res.data);

export const getNewsById = (id: string) =>
  api.get(`/news/${id}`).then(res => res.data);

export const createNews = (data: FormData) =>
  api.post('/news', data).then(res => res.data);

export const deleteNews = (id: string) =>
  api.delete(`/news/${id}`).then(res => res.data);

export const getComments = (id: string) =>
  api.get(`/news/${id}/comments`).then(res => res.data.data.comments || []);

export const deleteComment = (newsId: string, commentId: string) =>
  api.delete(`/news/${newsId}/comments/${commentId}`).then(res => res.data);

export const getAdminNews = (params: { page?: number; limit?: number; view?: 'active' | 'archived' | 'all'; search?: string; status?: string; category?: string }) =>
  api.get('/admin/news', { params }).then(res => res.data);

export const getAdminNewsById = (id: string) =>
  api.get(`/admin/news/${id}`).then(res => res.data);

export const updateAdminNews = (id: string, data: FormData) =>
  api.patch(`/admin/news/${id}`, data).then(res => res.data);

export const archiveAdminNews = (id: string) =>
  api.patch(`/admin/news/${id}/archive`).then(res => res.data);

export const restoreAdminNews = (id: string) =>
  api.patch(`/admin/news/${id}/restore`).then(res => res.data);

export const permanentlyDeleteAdminNews = (id: string) =>
  api.delete(`/admin/news/${id}`).then(res => res.data);

export const deleteAdminNewsMedia = (id: string, mediaIndex: number) =>
  api.delete(`/admin/news/${id}/media/${mediaIndex}`).then(res => res.data);

export const updateAdminNewsNotes = (id: string, payload: { adminNotes?: string; evidenceNotes?: string }) =>
  api.patch(`/admin/news/${id}/notes`, payload).then(res => res.data);

export const deleteAdminComment = (newsId: string, commentId: string) =>
  api.delete(`/admin/news/${newsId}/comments/${commentId}`).then(res => res.data);
