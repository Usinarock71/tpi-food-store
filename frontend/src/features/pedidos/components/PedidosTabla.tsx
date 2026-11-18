import type { EstadoPedido, Pedido } from '../types/pedido.types';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';

interface PedidosTablaProps {
  pedidos: Pedido[];
  esAdmin: boolean;
  onVerDetalle: (pedido: Pedido) => void;
  onCambiarEstado?: (id: number, estado: EstadoPedido) => void;
  onCancelarCliente?: (id: number) => void;
}

export function PedidosTabla({
  pedidos,
  esAdmin,
  onVerDetalle,
  onCambiarEstado,
  onCancelarCliente,
}: PedidosTablaProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">#ID</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Dirección</th>
            <th className="px-4 py-3">Pago</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-bold">#{p.id}</td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(p.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">{p.direccion_entrega}</td>
              <td className="px-4 py-3">{p.forma_pago}</td>
              <td className="px-4 py-3 font-semibold">${Number(p.total).toFixed(2)}</td>
              <td className="px-4 py-3">
                <BadgeEstado estado={p.estado} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex flex-wrap justify-end gap-2">
                  <Button variant="ghost" onClick={() => onVerDetalle(p)}>
                    Detalle
                  </Button>

                  {!esAdmin && p.estado === 'PENDIENTE' && onCancelarCliente && (
                    <Button variant="danger" onClick={() => onCancelarCliente(p.id)}>
                      Cancelar
                    </Button>
                  )}

                  {esAdmin && onCambiarEstado && p.estado === 'PENDIENTE' && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => onCambiarEstado(p.id, 'EN_PREPARACION')}
                      >
                        Preparar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => onCambiarEstado(p.id, 'CANCELADO')}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}

                  {esAdmin && onCambiarEstado && p.estado === 'EN_PREPARACION' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => onCambiarEstado(p.id, 'ENTREGADO')}
                      >
                        Entregar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => onCambiarEstado(p.id, 'CANCELADO')}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}