import api from './axios';

/**
 * News API — public feed + admin publish/delete.
 */
export const getFeed = (params: { page?: number; limit?: number; category?: string; search?: string }) =>
  api.get('/news', { params }).then(res => res.data);

export const getNewsById = (id: string) =>
  api.get(`/news/${id}`).then(res => res.data);

/** Admin: publish official news (multipart form data) */
export const createNews = (data: FormData) =>
  api.post('/news', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

/** Admin: delete a news article */
export const deleteNews = (id: string) =>
  api.delete(`/news/${id}`).then(res => res.data);