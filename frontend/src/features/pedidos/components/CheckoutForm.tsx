import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useCartStore } from '@/store/cartStore';
import { useCrearPedido } from '../hooks/useCrearPedido';
import type { FormaPago } from '../types/pedido.types';
import { handleApiError } from '@/shared/api/handleApiError';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

export function CheckoutForm() {
  const navigate = useNavigate();
  const { items, vaciar } = useCartStore();
  const crearPedido = useCrearPedido();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMsg(null);
      try {
        await crearPedido.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega,
          notas: value.notas,
        });
        vaciar();
        navigate('/mis-pedidos');
      } catch (err: unknown) {
        setErrorMsg(handleApiError(err, 'No se pudo confirmar el pedido'));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      {errorMsg && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{errorMsg}</div>
      )}

      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) =>
            value.trim().length < 5 || value.trim().length > 200
              ? 'La dirección debe tener entre 5 y 200 caracteres'
              : undefined,
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Av. Bunge 1234, Pinamar"
            error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Forma de pago</label>
            <select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="EFECTIVO">Efectivo al recibir</option>
              <option value="TRANSFERENCIA">Transferencia bancaria</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <Input
            label="Notas adicionales (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Ej: Timbre 2B, sin cebolla..."
          />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting || items.length === 0}
          >
            {isSubmitting ? 'Procesando pedido...' : 'Confirmar Pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}