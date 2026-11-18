import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productos.api';
import type { ProductoFiltros } from '../types/producto.types';

export function useProductos(filtros: ProductoFiltros) {
  const queryClient = useQueryClient();

  const productosQuery = useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productosApi.listar(filtros),
  });

  const crearProducto = useMutation({
    mutationFn: productosApi.crear,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const actualizarProducto = useMutation({
    mutationFn: productosApi.actualizar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const actualizarStock = useMutation({
    mutationFn: productosApi.actualizarStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const eliminarProducto = useMutation({
    mutationFn: productosApi.eliminar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    productos: productosQuery.data?.items ?? [],
    total: productosQuery.data?.total ?? 0,
    isLoading: productosQuery.isLoading,
    isError: productosQuery.isError,
    crearProducto,
    actualizarProducto,
    actualizarStock,
    eliminarProducto,
  };
}