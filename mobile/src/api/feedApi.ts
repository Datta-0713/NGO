import { api } from './axios';
import type { NewsItem, ApiResponse, Comment } from '../types';

interface FeedPage {
  news: NewsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const feedApi = {
  getFeed: async (params: { page: number; limit: number; category?: string; search?: string }) => {
    const response = await api.get<ApiResponse<FeedPage>>('/news', { params });
    return response.data.data;
  },
  getNewsById: async (id: string) => {
    const response = await api.get<ApiResponse<{ news: NewsItem }>>(`/news/${id}`);
    return response.data.data;
  },
  setLike: async (id: string) => {
    const response = await api.put<ApiResponse<{ likesCount: number; liked: boolean }>>(`/news/${id}/like`);
    return response.data.data;
  },
  removeLike: async (id: string) => {
    const response = await api.delete<ApiResponse<{ likesCount: number; liked: boolean }>>(`/news/${id}/like`);
    return response.data.data;
  },
  saveNews: async (id: string) => {
    const response = await api.put<ApiResponse<{ saved: boolean }>>(`/news/${id}/save`);
    return response.data.data;
  },
  unsaveNews: async (id: string) => {
    const response = await api.delete<ApiResponse<{ saved: boolean }>>(`/news/${id}/save`);
    return response.data.data;
  },
  getSavedNews: async (params: { page: number; limit: number }) => {
    const response = await api.get<ApiResponse<FeedPage>>('/news/saved/mine', { params });
    return response.data.data;
  },
  getComments: async (newsId: string) => {
    const response = await api.get<ApiResponse<{ comments: Comment[]; total: number }>>(`/news/${newsId}/comments`);
    return response.data.data;
  },
  addComment: async (newsId: string, text: string) => {
    const response = await api.post<ApiResponse<{ comment: Comment; commentsCount: number }>>(`/news/${newsId}/comments`, { text });
    return response.data.data;
  },
  deleteComment: async (newsId: string, commentId: string) => {
    const response = await api.delete<ApiResponse<{ commentsCount: number }>>(`/news/${newsId}/comments/${commentId}`);
    return response.data.data;
  },
};
