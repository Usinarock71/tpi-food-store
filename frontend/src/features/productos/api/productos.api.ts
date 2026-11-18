import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  Producto,
  ProductoFiltros,
  ProductoPayload,
  ProductosPaginados,
  ProductoStockPayload,
} from '../types/producto.types';

export const productosApi = {
  listar: async (filtros: ProductoFiltros): Promise<ProductosPaginados> => {
    const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
      params: filtros,
    });
    return data;
  },
  crear: async (payload: ProductoPayload): Promise<Producto> => {
    const { data } = await axiosInstance.post<Producto>('/productos', payload);
    return data;
  },
  actualizar: async ({ id, payload }: { id: number; payload: ProductoPayload }): Promise<Producto> => {
    const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, payload);
    return data;
  },
  actualizarStock: async ({
    id,
    payload,
  }: {
    id: number;
    payload: ProductoStockPayload;
  }): Promise<Producto> => {
    const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, payload);
    return data;
  },
  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/productos/${id}`);
  },
};