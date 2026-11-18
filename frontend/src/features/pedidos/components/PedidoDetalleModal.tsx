import type { Pedido } from '../types/pedido.types';
import { Modal } from '@/shared/ui/Modal';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';

interface Props {
  pedido: Pedido | null;
  onClose: () => void;
}

export function PedidoDetalleModal({ pedido, onClose }: Props) {
  return (
    <Modal open={Boolean(pedido)} title={`Detalle Pedido #${pedido?.id ?? ''}`} onClose={onClose}>
      {pedido && (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Estado:</span>
            <BadgeEstado estado={pedido.estado} />
          </div>
          <div>
            <span className="font-semibold">Dirección de entrega:</span> {pedido.direccion_entrega}
          </div>
          <div>
            <span className="font-semibold">Forma de pago:</span> {pedido.forma_pago}
          </div>
          {pedido.notas && (
            <div>
              <span className="font-semibold">Notas:</span> {pedido.notas}
            </div>
          )}

          <div className="border-t border-slate-200 pt-3">
            <p className="mb-2 font-bold">Ítems del pedido:</p>
            <ul className="divide-y divide-slate-100">
              {pedido.items.map((item) => (
                <li key={item.id} className="flex justify-between py-2">
                  <span>
                    {item.cantidad}x {item.nombre_producto} (${Number(item.precio_unitario).toFixed(2)})
                  </span>
                  <span className="font-semibold">${Number(item.subtotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
            <span>Total</span>
            <span>${Number(pedido.total).toFixed(2)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}