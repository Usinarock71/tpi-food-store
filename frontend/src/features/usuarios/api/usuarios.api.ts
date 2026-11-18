import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { Usuario } from '../types/usuario.types';

export const usuariosApi = {
  listar: async (): Promise<Usuario[]> => {
    const { data } = await axiosInstance.get<Usuario[]>('/admin/usuarios');
    return data;
  },
  activar: async (id: number): Promise<Usuario> => {
    const { data } = await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/activar`);
    return data;
  },
  desactivar: async (id: number): Promise<Usuario> => {
    const { data } = await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/desactivar`);
    return data;
  },
};