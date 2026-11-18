import { Button } from '../../shared/ui/Button';

interface PaginacionProps {
  pagina: number;
  limit: number;
  total: number;
  onPageChange: (nuevaPagina: number) => void;
}

export function Paginacion({ pagina, limit, total, onPageChange }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-600">
        Mostrando página <span className="font-semibold">{pagina + 1}</span> de{' '}
        <span className="font-semibold">{totalPaginas}</span> ({total} registros)
      </p>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          disabled={pagina === 0}
          onClick={() => onPageChange(pagina - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="ghost"
          disabled={pagina + 1 >= totalPaginas}
          onClick={() => onPageChange(pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}