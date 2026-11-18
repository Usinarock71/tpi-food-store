import { useResumenPedidos } from '../hooks/useResumenPedidos';
import { ResumenCard } from '../components/ResumenCard';
import { EstadoError } from '@/shared/components/EstadoError';

export function AdminResumenPage() {
  const { data, isLoading, isError } = useResumenPedidos();

  if (isLoading) return <p className="text-center text-slate-500">Cargando resumen...</p>;
  if (isError || !data) return <EstadoError mensaje="Error al obtener indicadores del negocio" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resumen del Negocio</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResumenCard titulo="Pedidos Pendientes" valor={data.pendientes} acento="text-amber-600" />
        <ResumenCard
          titulo="En Preparación"
          valor={data.en_preparacion}
          acento="text-sky-600"
        />
        <ResumenCard
          titulo="Pedidos Entregados"
          valor={data.entregados}
          acento="text-emerald-600"
        />
        <ResumenCard
          titulo="Pedidos Cancelados"
          valor={data.cancelados}
          acento="text-rose-600"
        />
        <ResumenCard titulo="Pedidos de Hoy" valor={data.pedidos_hoy} />
        <ResumenCard
          titulo="Ingresos Entregados"
          valor={`$${Number(data.ingresos_entregados).toFixed(2)}`}
          acento="text-emerald-700"
        />
      </div>
    </div>
  );
}