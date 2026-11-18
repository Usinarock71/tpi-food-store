export function EstadoError({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
      <p className="font-medium">{mensaje}</p>
    </div>
  );
}