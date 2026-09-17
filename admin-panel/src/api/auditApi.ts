import api from './axios';
export interface AuditLog { _id: string; admin?: { _id: string; name: string; email: string; profilePhoto?: string } | null; action: string; entityType: string; entityId?: string | null; before?: unknown; after?: unknown; reason?: string; ip?: string; userAgent?: string; createdAt: string; }
export const auditApi = { getLogs: (params: { page?: number; limit?: number; action?: string; entityType?: string }) => api.get('/admin/audit-logs', { params }).then(res => res.data.data) };
