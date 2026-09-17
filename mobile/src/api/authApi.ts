import * as SecureStore from 'expo-secure-store';
import { api } from './axios';
import type { User, ApiResponse } from '../types';

interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  logout: async (refreshToken: string) => {
    // Best-effort device deregistration prevents push notifications reaching a logged-out account.
    // Logout itself remains server-side idempotent even if token deregistration fails.
    try {
      const deviceId = await SecureStore.getItemAsync('deviceId');
      if (deviceId) {
        await api.delete('/users/me/push-token', { data: { deviceId } });
      }
    } catch {
      // Do not block logout because an expired access token/network issue prevented cleanup.
    }
    const response = await api.post<ApiResponse<null>>('/auth/logout', { refreshToken }, { _skipAuthRefresh: true } as any);
    return response.data;
  },
  /** POST /api/auth/login */
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/login', credentials);
    return response.data; // Full ApiResponse — slice reads .data.user, .data.accessToken etc.
  },

  /** POST /api/auth/register */
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/register', userData);
    return response.data;
  },

  /** GET /api/auth/me — get minimal user from auth token */
  getMe: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data; // slice reads .data.user
  },

  /** PATCH /api/users/me — update name/bio/location/photo */
  updateProfile: async (formData: FormData) => {
    const response = await api.patch<ApiResponse<{ user: User }>>('/users/me', formData);
    return response.data; // slice reads .data.user
  },
};
