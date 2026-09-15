import api from './axios';

/**
 * Submissions API — uses admin-scoped routes.
 * Backend routes: GET/PATCH /api/admin/submissions/*
 */
export const getSubmissions = (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => api.get('/admin/submissions', { params }).then(res => res.data);

export const getSubmissionById = (id: string) =>
  api.get(`/admin/submissions/${id}`).then(res => res.data);

export const approveSubmission = (id: string) =>
  api.patch(`/admin/submissions/${id}/approve`).then(res => res.data);

export const rejectSubmission = (id: string, rejectionMessage: string) =>
  api.patch(`/admin/submissions/${id}/reject`, { rejectionMessage }).then(res => res.data);