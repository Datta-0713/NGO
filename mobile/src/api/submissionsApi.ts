import { api } from './axios';
import type { NewsItem, ApiResponse } from '../types';

interface SubmissionsPaginatedResponse {
  submissions: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const submissionsApi = {
  /** POST /api/submissions — submit a news story with media */
  submitNews: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** GET /api/submissions/mine — get current user's own submissions */
  getMySubmissions: async (params: { page: number; limit: number }) => {
    const response = await api.get<ApiResponse<SubmissionsPaginatedResponse>>('/submissions/mine', { params });
    return response.data;
  },
};
