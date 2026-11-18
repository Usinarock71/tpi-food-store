import type { Producto } from '../types/producto.types';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const sinStock = !producto.disponible || producto.stock <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img
        src={producto.imagen_url || 'https://placehold.co/600x400?text=Food+Store'}
        alt={producto.nombre}
        className="h-44 w-full object-cover"
      />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
            {producto.categoria.nombre}
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{producto.nombre}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{producto.descripcion}</p>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-extrabold text-slate-900">
                ${Number(producto.precio_base).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">Stock: {producto.stock}</p>
            </div>
            <Button
              disabled={sinStock}
              onClick={() =>
                agregar({
                  producto_id: producto.id,
                  nombre: producto.nombre,
                  precio_unitario: Number(producto.precio_base),
                  imagen_url: producto.imagen_url,
                  stock: producto.stock,
                })
              }
            >
              {sinStock ? 'No disponible' : 'Agregar al carrito'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}