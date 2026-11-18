import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const url = error.config?.url ?? '';

    const esRutaAuth = url.includes('/auth/token') || url.includes('/auth/me');
    const esCuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada';

    if ((status === 401 && !esRutaAuth) || esCuentaDesactivada) {
      useAuthStore.getState().limpiarSesion();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);