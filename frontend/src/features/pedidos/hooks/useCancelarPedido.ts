import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidos.api';

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pedidosApi.cancelar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
    },
  });
}