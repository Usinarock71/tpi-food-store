import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias.api';

export function useCategorias() {
  const queryClient = useQueryClient();

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listar,
  });

  const crearCategoria = useMutation({
    mutationFn: categoriasApi.crear,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const actualizarCategoria = useMutation({
    mutationFn: categoriasApi.actualizar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const eliminarCategoria = useMutation({
    mutationFn: categoriasApi.eliminar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  return {
    categorias: categoriasQuery.data ?? [],
    isLoading: categoriasQuery.isLoading,
    isError: categoriasQuery.isError,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
}