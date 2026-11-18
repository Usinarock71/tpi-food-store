import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../shared/ui/Button';

export function Navbar() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const cantidadCarrito = useCartStore((s) => s.cantidadTotal());
  const esAdmin = usuario?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-orange-600 text-white' : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="text-xl font-extrabold text-orange-600">
            🍔 Food Store
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={navClass}>
              Carrito ({cantidadCarrito})
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={navClass}>
                Mis pedidos
              </NavLink>
            )}
            {esAdmin && (
              <>
                <span className="mx-1 text-slate-300">|</span>
                <NavLink to="/admin/resumen" className={navClass}>
                  Resumen
                </NavLink>
                <NavLink to="/admin/pedidos" className={navClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/admin/productos" className={navClass}>
                  Productos
                </NavLink>
                <NavLink to="/admin/categorias" className={navClass}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/usuarios" className={navClass}>
                  Usuarios
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-xs">
                <p className="font-semibold text-slate-900">{usuario.full_name}</p>
                <p className="text-slate-500">
                  @{usuario.username} · <span className="uppercase">{usuario.role}</span>
                </p>
              </div>
              <Button variant="ghost" onClick={() => void handleLogout()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost">Ingresar</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}