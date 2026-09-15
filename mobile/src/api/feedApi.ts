import { api } from './axios';
import type { NewsItem, ApiResponse } from '../types';

interface FeedPage {
  news: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const feedApi = {
  /** GET /api/news — public paginated feed of published stories */
  getFeed: async (params: { page: number; limit: number; category?: string; search?: string }) => {
    const response = await api.get<ApiResponse<FeedPage>>('/news', { params });
    // response.data = ApiResponse → response.data.data = { news, total, page, totalPages }
    return response.data.data;
  },

  /** GET /api/news/:id — single story with view count increment */
  getNewsById: async (id: string) => {
    const response = await api.get<ApiResponse<{ news: NewsItem }>>(`/news/${id}`);
    return response.data.data;
  },

  /** PATCH /api/news/:id/like — toggle like */
  likeNews: async (id: string) => {
    const response = await api.patch<ApiResponse<{ likesCount: number; liked: boolean }>>(`/news/${id}/like`);
    return response.data.data;
  },
};
