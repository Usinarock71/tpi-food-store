import { useState } from 'react';
import { usePedidos } from '../hooks/usePedidos';
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido';
import type { EstadoPedido, Pedido } from '../types/pedido.types';
import { PedidosTabla } from '../components/PedidosTabla';
import { PedidoDetalleModal } from '../components/PedidoDetalleModal';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Paginacion } from '@/shared/components/Paginacion';

const LIMIT = 10;

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);

  const { data, isLoading, isError } = usePedidos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    estado: filtroEstado || undefined,
  });
  const cambiarEstado = useCambiarEstadoPedido();

  if (isLoading) return <p className="text-center text-slate-500">Cargando pedidos...</p>;
  if (isError) return <EstadoError mensaje="Error al cargar los pedidos" />;

  const pedidos = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <select
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value as EstadoPedido | '');
            setPagina(0);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {pedidos.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar con este filtro." />
      ) : (
        <>
          <PedidosTabla
            pedidos={pedidos}
            esAdmin={true}
            onVerDetalle={setPedidoDetalle}
            onCambiarEstado={(id, estado) => cambiarEstado.mutate({ id, estado })}
          />
          <Paginacion pagina={pagina} limit={LIMIT} total={total} onPageChange={setPagina} />
        </>
      )}

      <PedidoDetalleModal pedido={pedidoDetalle} onClose={() => setPedidoDetalle(null)} />
    </div>
  );
}