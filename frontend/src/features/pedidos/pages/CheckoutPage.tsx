import { Navigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Card } from '@/shared/ui/Card';
import { CheckoutForm } from '../components/CheckoutForm';

export function CheckoutPage() {
  const { items, total } = useCartStore();

  if (items.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Confirmar Pedido</h1>
      <Card>
        <div className="mb-4 border-b border-slate-200 pb-4">
          <h2 className="font-bold text-slate-800">Detalle a confirmar</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between">
                <span>
                  {item.cantidad}x {item.nombre}
                </span>
                <span>${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-lg font-extrabold text-slate-900">
            Total a pagar: ${total().toFixed(2)}
          </p>
        </div>
        <CheckoutForm />
      </Card>
    </div>
  );
}