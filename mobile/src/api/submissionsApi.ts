import { api } from './axios';
import type { NewsItem, ApiResponse } from '../types';

interface SubmissionsPaginatedResponse {
  submissions: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const submissionsApi = {
  /** POST /api/submissions — submit a news story with optional media
   *  NOTE: Do NOT set Content-Type manually. Axios auto-generates
   *  the correct 'multipart/form-data; boundary=XXX' header for FormData.
   */
  submitNews: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>('/submissions', formData);
    return response.data;
  },

  /** GET /api/submissions/mine — get current user's own submissions */
  getMySubmissions: async (params: { page: number; limit: number }) => {
    const response = await api.get<ApiResponse<SubmissionsPaginatedResponse>>('/submissions/mine', { params });
    return response.data;
  },
};
