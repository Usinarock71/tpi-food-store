export function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
      <p className="text-base font-medium text-slate-600">{mensaje}</p>
    </div>
  );
}