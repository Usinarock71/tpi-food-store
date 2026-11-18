import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  EstadoPedido,
  Pedido,
  PedidoCreatePayload,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types';

export const pedidosApi = {
  crear: async (payload: PedidoCreatePayload): Promise<Pedido> => {
    const { data } = await axiosInstance.post<Pedido>('/pedidos', payload);
    return data;
  },
  listar: async (params: { skip?: number; limit?: number; estado?: EstadoPedido }): Promise<PedidosPaginados> => {
    const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', { params });
    return data;
  },
  obtenerPorId: async (id: number): Promise<Pedido> => {
    const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
    return data;
  },
  cambiarEstado: async ({ id, estado }: { id: number; estado: EstadoPedido }): Promise<Pedido> => {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
    return data;
  },
  cancelar: async (id: number): Promise<Pedido> => {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return data;
  },
  obtenerResumen: async (): Promise<ResumenPedidos> => {
    const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
    return data;
  },
};