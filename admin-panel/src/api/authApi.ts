import api from './axios';

export const login = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const getMe = () => api.get('/auth/me').then(res => res.data);