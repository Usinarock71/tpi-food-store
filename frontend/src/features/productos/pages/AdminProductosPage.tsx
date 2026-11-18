import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { useCategorias } from '@/features/categorias';
import { useProductos } from '../hooks/useProductos';
import type { Producto } from '../types/producto.types';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { EstadoError } from '@/shared/components/EstadoError';

const columnHelper = createColumnHelper<Producto>();

export function AdminProductosPage() {
  const { categorias } = useCategorias();
  const {
    productos,
    isLoading,
    isError,
    crearProducto,
    actualizarProducto,
    actualizarStock,
    eliminarProducto,
  } = useProductos({ skip: 0, limit: 100 });

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [stockModalProd, setStockModalProd] = useState<Producto | null>(null);
  const [nuevoStock, setNuevoStock] = useState(0);
  const [nuevaDisponibilidad, setNuevaDisponibilidad] = useState(true);

  const form = useForm({
    defaultValues: {
      categoria_id: 0,
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (editando) {
          await actualizarProducto.mutateAsync({ id: editando.id, payload: value });
        } else {
          await crearProducto.mutateAsync(value);
        }
        setModalFormOpen(false);
      } catch (err: unknown) {
        setFormError(handleApiError(err, 'No se pudo guardar el producto'));
      }
    },
  });

  const abrirNuevo = () => {
    setEditando(null);
    setFormError(null);
    form.reset({
      categoria_id: categorias[0]?.id ?? 0,
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 10,
      disponible: true,
    });
    setModalFormOpen(true);
  };

  const abrirEditar = (prod: Producto) => {
    setEditando(prod);
    setFormError(null);
    form.reset({
      categoria_id: prod.categoria_id,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio_base: Number(prod.precio_base),
      imagen_url: prod.imagen_url,
      stock: prod.stock,
      disponible: prod.disponible,
    });
    setModalFormOpen(true);
  };

  const abrirStock = (prod: Producto) => {
    setStockModalProd(prod);
    setNuevoStock(prod.stock);
    setNuevaDisponibilidad(prod.disponible);
  };

  const guardarStock = async () => {
    if (!stockModalProd) return;
    await actualizarStock.mutateAsync({
      id: stockModalProd.id,
      payload: { stock: nuevoStock, disponible: nuevaDisponibilidad },
    });
    setStockModalProd(null);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', { header: 'Producto' }),
      columnHelper.accessor((row) => row.categoria.nombre, {
        id: 'categoria',
        header: 'Categoría',
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor('stock', { header: 'Stock' }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Sí
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Pausado
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => abrirStock(row.original)}>
              Stock
            </Button>
            <Button variant="ghost" onClick={() => abrirEditar(row.original)}>
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => eliminarProducto.mutate(row.original.id)}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categorias]
  );

  const table = useReactTable({
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <p className="text-center text-slate-500">Cargando productos...</p>;
  if (isError) return <EstadoError mensaje="Error al cargar los productos" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">ABM de Productos</h1>
        <Button onClick={abrirNuevo}>+ Nuevo Producto</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">
          Página {table.getState().pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal Crear / Editar Producto */}
      <Modal
        open={modalFormOpen}
        title={editando ? 'Editar Producto' : 'Nuevo Producto'}
        onClose={() => setModalFormOpen(false)}
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-3"
        >
          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) => (value <= 0 ? 'Seleccioná una categoría' : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Categoría</label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value={0}>Seleccionar...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-rose-600">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Nombre"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <Input
                label="Descripción"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) => (value < 0 ? 'No puede ser negativo' : undefined),
              }}
            >
              {(field) => (
                <Input
                  label="Precio base"
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
                />
              )}
            </form.Field>

            <form.Field
              name="stock"
              validators={{
                onChange: ({ value }) => (value < 0 ? 'No puede ser negativo' : undefined),
              }}
            >
              {(field) => (
                <Input
                  label="Stock inicial"
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="imagen_url">
            {(field) => (
              <Input
                label="URL de imagen"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                Disponible para la venta
              </label>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Stock y Disponibilidad */}
      <Modal
        open={Boolean(stockModalProd)}
        title={`Stock: ${stockModalProd?.nombre ?? ''}`}
        onClose={() => setStockModalProd(null)}
      >
        <div className="space-y-4">
          <Input
            label="Cantidad en stock"
            type="number"
            min={0}
            value={nuevoStock}
            onChange={(e) => setNuevoStock(Math.max(0, Number(e.target.value)))}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={nuevaDisponibilidad}
              onChange={(e) => setNuevaDisponibilidad(e.target.checked)}
            />
            Producto disponible
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setStockModalProd(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void guardarStock()}>Actualizar stock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}