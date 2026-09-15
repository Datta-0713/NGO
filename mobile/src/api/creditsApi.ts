import { api } from './axios';
import type { CreditTransaction, ApiResponse } from '../types';

interface CreditHistoryPage {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export const creditsApi = {
  /** GET /api/credits/history — paginated credit transaction history for current user */
  getCreditHistory: async (params: { page: number; limit: number }) => {
    const response = await api.get<ApiResponse<CreditHistoryPage>>('/credits/history', { params });
    // response.data = ApiResponse → .data = { transactions, total, page, totalPages }
    return response.data.data;
  },
};
