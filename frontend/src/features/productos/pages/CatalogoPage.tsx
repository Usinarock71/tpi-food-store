import { useState } from 'react';
import { useCategorias } from '@/features/categorias';
import { useProductos } from '../hooks/useProductos';
import { ProductoCard } from '../components/ProductoCard';
import { SkeletonGrid } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Paginacion } from '@/shared/components/Paginacion';

const LIMIT = 6;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { categorias } = useCategorias();
  const { productos, total, isLoading, isError } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search.trim() || undefined,
    categoria_id: categoriaId,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuestro Menú</h1>
          <p className="text-sm text-slate-500">Elegí tus platos favoritos y armá tu pedido</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar comida..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />

          <select
            value={categoriaId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setCategoriaId(val ? Number(val) : undefined);
              setPagina(0);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={LIMIT} />
      ) : isError ? (
        <EstadoError mensaje="Error al cargar el catálogo de productos" />
      ) : productos.length === 0 ? (
        <EstadoVacio mensaje="No se encontraron productos con esos filtros." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((prod) => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            limit={LIMIT}
            total={total}
            onPageChange={setPagina}
          />
        </>
      )}
    </div>
  );
}