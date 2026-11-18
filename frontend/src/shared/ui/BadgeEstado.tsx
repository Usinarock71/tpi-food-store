import type { EstadoPedido } from '../../features/pedidos';

const badgeStyles: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-300',
  EN_PREPARACION: 'bg-sky-100 text-sky-800 border-sky-300',
  ENTREGADO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CANCELADO: 'bg-rose-100 text-rose-800 border-rose-300',
};

const badgeLabels: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[estado]}`}
    >
      {badgeLabels[estado]}
    </span>
  );
}