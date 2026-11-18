import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios.api';

export function useUsuarios() {
  const queryClient = useQueryClient();

  const usuariosQuery = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: usuariosApi.listar,
  });

  const activarMutation = useMutation({
    mutationFn: usuariosApi.activar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: usuariosApi.desactivar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
  });

  return {
    usuarios: usuariosQuery.data ?? [],
    isLoading: usuariosQuery.isLoading,
    isError: usuariosQuery.isError,
    activarUsuario: activarMutation,
    desactivarUsuario: desactivarMutation,
  };
}