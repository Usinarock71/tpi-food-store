import { useQuery } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidos.api';

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos-resumen'],
    queryFn: pedidosApi.obtenerResumen,
  });
}