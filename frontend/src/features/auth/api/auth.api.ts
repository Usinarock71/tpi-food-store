import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { RegisterPayload, UserPublic } from '../types/auth.types';

export const authApi = {
  login: async (username: string, password: string): Promise<void> => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    await axiosInstance.post('/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  register: async (payload: RegisterPayload): Promise<UserPublic> => {
    const { data } = await axiosInstance.post<UserPublic>('/auth/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  getMe: async (): Promise<UserPublic> => {
    const { data } = await axiosInstance.get<UserPublic>('/auth/me');
    return data;
  },
};