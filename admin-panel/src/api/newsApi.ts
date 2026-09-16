import api from './axios';

/**
 * News API — public feed + admin publish/delete.
 */
export const getFeed = (params: { page?: number; limit?: number; category?: string; search?: string }) =>
  api.get('/news', { params }).then(res => res.data);

export const getNewsById = (id: string) =>
  api.get(`/news/${id}`).then(res => res.data);

/** Admin: publish official news (multipart form data)
 *  NOTE: Do NOT pass a manual Content-Type header here.
 *  Axios auto-detects FormData and sets the correct
 *  'multipart/form-data; boundary=XXXX' header — setting it
 *  manually strips the boundary and breaks multer file parsing.
 */
export const createNews = (data: FormData) =>
  api.post('/news', data).then(res => res.data);

/** Admin: delete a news article */
export const deleteNews = (id: string) =>
  api.delete(`/news/${id}`).then(res => res.data);

export const getComments = (id: string) =>
  api.get(`/news/${id}/comments`).then(res => res.data.data.comments || []);

export const deleteComment = (newsId: string, commentId: string) =>
  api.delete(`/news/${newsId}/comments/${commentId}`).then(res => res.data);