import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

export function CarritoPage() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tu Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío. Agregá productos desde el catálogo." />
        <Link to="/">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tu Carrito</h1>
        <Button variant="ghost" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id} className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900">{item.nombre}</h3>
                <p className="text-sm text-slate-500">
                  ${item.precio_unitario.toFixed(2)} c/u · Subtotal: $
                  {(item.precio_unitario * item.cantidad).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  -
                </Button>
                <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                <Button
                  variant="ghost"
                  disabled={item.cantidad >= item.stock}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
                <Button variant="danger" onClick={() => quitar(item.producto_id)}>
                  Quitar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit space-y-4">
          <h2 className="text-lg font-bold">Resumen de compra</h2>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-extrabold">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="block">
            <Button className="w-full">Continuar al Checkout</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}