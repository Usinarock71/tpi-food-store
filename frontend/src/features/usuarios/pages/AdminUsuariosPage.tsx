import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useAuthStore } from '../../../store/authStore';
import { useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '../types/usuario.types';
import { Button } from '../../../shared/ui/Button';
import { EstadoError } from '../../../shared/components/EstadoError';

const columnHelper = createColumnHelper<Usuario>();

export function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((s) => s.usuario);
  const { usuarios, isLoading, isError, activarUsuario, desactivarUsuario } = useUsuarios();

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', { header: 'Usuario' }),
      columnHelper.accessor('full_name', { header: 'Nombre completo' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
              Desactivado
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Activo
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original;
          const esMismoUsuario = usuarioActual?.id === u.id;

          if (esMismoUsuario) {
            return <span className="text-xs italic text-slate-400">Sesión actual</span>;
          }

          return u.disabled ? (
            <Button
              variant="primary"
              onClick={() => activarUsuario.mutate(u.id)}
              disabled={activarUsuario.isPending}
            >
              Activar
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={() => desactivarUsuario.mutate(u.id)}
              disabled={desactivarUsuario.isPending}
            >
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [usuarioActual?.id, activarUsuario, desactivarUsuario]
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p className="text-center text-slate-500">Cargando usuarios...</p>;
  if (isError) return <EstadoError mensaje="No se pudieron cargar los usuarios" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>

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
    </div>
  );
}