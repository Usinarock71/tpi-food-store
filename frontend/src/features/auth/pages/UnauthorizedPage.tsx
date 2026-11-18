import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-extrabold text-rose-600">403</h1>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">Sin permiso de acceso</h2>
      <p className="mt-2 max-w-md text-slate-600">
        Tu usuario no cuenta con los permisos necesarios para ingresar a esta pantalla.
      </p>
      <Link to="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}