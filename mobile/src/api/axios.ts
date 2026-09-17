import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';
import { store } from '../store';
import { logout, setTokens } from '../store/slices/authSlice';

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

const defaultAxios = axios;

export const api = defaultAxios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const deviceId = await SecureStore.getItemAsync('deviceId');
  if (deviceId) config.headers['X-Device-Id'] = deviceId;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const { data } = await defaultAxios.post(
      `${Config.API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
      { timeout: 20_000 },
    );
    const accessToken = data.data.accessToken;
    const nextRefresh = data.data.refreshToken;
    await SecureStore.setItemAsync('accessToken', accessToken);
    if (nextRefresh) await SecureStore.setItemAsync('refreshToken', nextRefresh);
    store.dispatch(setTokens({ accessToken, refreshToken: nextRefresh || refreshToken }));
    return accessToken;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as RetriableConfig;
    const requestUrl = String(originalRequest.url || '');
    const isAuthRoute = /\/auth\/(login|register|refresh-token|forgot-password|reset-password)/.test(requestUrl);
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipAuthRefresh && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
