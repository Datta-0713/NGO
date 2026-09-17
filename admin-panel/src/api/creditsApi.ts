import api from './axios';

export const creditsApi = {
  adjustCredits: (userId: string, amount: number, reason: string, action: 'credit' | 'debit') =>
    api.post(`/credits/adjust`, { userId, amount: Math.abs(amount), reason, action }).then(res => res.data),
  getAllTransactions: (page = 1, limit = 20) =>
    api.get(`/credits/all`, { params: { page, limit } }).then(res => res.data.data),
};

// Named exports for backward compat
export const adjustCredits = creditsApi.adjustCredits;