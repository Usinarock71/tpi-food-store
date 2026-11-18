import { useState } from 'react';
import { usePedidos } from '../hooks/usePedidos';
import { useCancelarPedido } from '../hooks/useCancelarPedido';
import type { Pedido } from '../types/pedido.types';
import { PedidosTabla } from '../components/PedidosTabla';
import { PedidoDetalleModal } from '../components/PedidoDetalleModal';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Paginacion } from '@/shared/components/Paginacion';

const LIMIT = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);

  const { data, isLoading, isError } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT });
  const cancelarPedido = useCancelarPedido();

  if (isLoading) return <p className="text-center text-slate-500">Cargando tus pedidos...</p>;
  if (isError) return <EstadoError mensaje="No se pudieron cargar tus pedidos" />;

  const pedidos = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <EstadoVacio mensaje="Aún no realizaste ningún pedido." />
      ) : (
        <>
          <PedidosTabla
            pedidos={pedidos}
            esAdmin={false}
            onVerDetalle={setPedidoDetalle}
            onCancelarCliente={(id) => cancelarPedido.mutate(id)}
          />
          <Paginacion pagina={pagina} limit={LIMIT} total={total} onPageChange={setPagina} />
        </>
      )}

      <PedidoDetalleModal pedido={pedidoDetalle} onClose={() => setPedidoDetalle(null)} />
    </div>
  );
}