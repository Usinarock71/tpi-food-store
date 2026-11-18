import { useQuery } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidos.api';
import type { EstadoPedido } from '../types/pedido.types';

export function usePedidos(params: { skip?: number; limit?: number; estado?: EstadoPedido }) {
  return useQuery({
    queryKey: ['pedidos', params],
    queryFn: () => pedidosApi.listar(params),
  });
}