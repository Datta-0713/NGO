import api from './axios';
export type ReportStatus = 'open' | 'reviewed' | 'dismissed' | 'actioned';
export interface ReportRecord { _id: string; news?: { _id: string; title: string; status: string } | null; reportedBy?: { _id: string; name: string; email: string; profilePhoto?: string } | null; reason: string; status: ReportStatus; reviewedBy?: { _id: string; name: string } | null; reviewedAt?: string | null; resolution?: string; createdAt: string; }
export const reportsApi = {
  getReports: (params: { page?: number; limit?: number; status?: ReportStatus }) => api.get('/admin/reports', { params }).then(res => res.data.data),
  resolveReport: (id: string, status: Exclude<ReportStatus, 'open'>, resolution: string) => api.patch(`/admin/reports/${id}`, { status, resolution }).then(res => res.data.data),
};
