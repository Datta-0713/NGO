import api from './axios';

export const getSubmissions = (params: { page?: number; limit?: number; status?: string; search?: string }) =>
  api.get('/admin/submissions', { params }).then(res => res.data);

export const getSubmissionById = (id: string) => api.get(`/admin/submissions/${id}`).then(res => res.data);
export const getSubmissionHistory = (id: string) => api.get(`/admin/submissions/${id}/history`).then(res => res.data);
export const claimSubmission = (id: string) => api.patch(`/admin/submissions/${id}/claim`).then(res => res.data);
export const approveSubmission = (id: string) => api.patch(`/admin/submissions/${id}/approve`).then(res => res.data);
export const requestChanges = (id: string, rejectionMessage: string) => api.patch(`/admin/submissions/${id}/request-changes`, { rejectionMessage }).then(res => res.data);
export const rejectSubmission = (id: string, rejectionMessage: string) => api.patch(`/admin/submissions/${id}/reject`, { rejectionMessage }).then(res => res.data);
export const updateSubmissionNotes = (id: string, payload: { adminNotes?: string; evidenceNotes?: string }) =>
  api.patch(`/admin/submissions/${id}/notes`, payload).then(res => res.data);
