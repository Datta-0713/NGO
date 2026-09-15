import api from './axios';

export const creditsApi = {
  adjustCredits: (userId: string, amount: number, reason: string) =>
    api.post(`/admin/users/${userId}/credits`, { amount, reason }).then(res => res.data),
  getCreditHistory: (userId: string, page = 1, limit = 20) =>
    api.get(`/credits/history/${userId}`, { params: { page, limit } }).then(res => res.data),
};

// Named exports for backward compat
export const adjustCredits = creditsApi.adjustCredits;