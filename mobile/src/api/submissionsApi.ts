import { api } from './axios';
import type { NewsItem, ApiResponse } from '../types';

interface SubmissionsPaginatedResponse {
  submissions: NewsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const submissionsApi = {
  submitNews: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>('/submissions', formData);
    return response.data;
  },
  getMySubmissions: async (params: { page: number; limit: number; status?: string }) => {
    const response = await api.get<ApiResponse<SubmissionsPaginatedResponse>>('/submissions/mine', { params });
    return response.data;
  },
  getMySubmission: async (id: string) => {
    const response = await api.get<ApiResponse<{ news: NewsItem }>>(`/submissions/${id}`);
    return response.data.data;
  },
  getHistory: async (id: string) => {
    const response = await api.get<ApiResponse<{ revisions: Array<NewsItem & { revisionNumber: number; changeNote: string; author: any }> }>>(`/submissions/${id}/history`);
    return response.data.data;
  },
  resubmitNews: async (id: string, formData: FormData) => {
    const response = await api.patch<ApiResponse<{ news: NewsItem }>>(`/submissions/${id}/resubmit`, formData);
    return response.data;
  },
};
