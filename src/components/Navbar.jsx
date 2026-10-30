import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const linkClase = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-ucp-verde' : 'text-slate-600 hover:text-ucp-verde'}`;

const EnlacesNav = ({ onNavigate }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    onNavigate?.();
    navigate('/landing');
  };

  return (
    <>
      <NavLink to="/proyectos/pub" className={linkClase} onClick={onNavigate}>
        Proyectos
      </NavLink>
      {usuario && (
        <NavLink to="/proyectos/nuevo" className={linkClase} onClick={onNavigate}>
          Nuevo proyecto
        </NavLink>
      )}
      {usuario?.rol === 'admin' && (
        <NavLink to="/admin/usuarios" className={linkClase} onClick={onNavigate}>
          Usuarios
        </NavLink>
      )}
      {usuario ? (
        <button
          type="button"
          onClick={cerrarSesion}
          className="text-sm font-medium text-slate-600 transition-colors hover:text-ucp-granate"
        >
          Cerrar sesión
        </button>
      ) : (
        <NavLink to="/login" className={linkClase} onClick={onNavigate}>
          Iniciar sesión
        </NavLink>
      )}
    </>
  );
};

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white">
      {/* Franja institucional (ver ADR 0007): granate / verde / dorado en tercios iguales */}
      <div className="flex h-1" aria-hidden="true">
        <div className="flex-1 bg-ucp-granate" />
        <div className="flex-1 bg-ucp-verde" />
        <div className="flex-1 bg-ucp-dorado" />
      </div>

      <div className="border-b border-slate-200">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/landing" className="font-semibold text-slate-800">
            Portal de Proyectos <span className="text-ucp-granate">UCP</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <EnlacesNav />
          </nav>

          <button
            type="button"
            className="p-2 text-slate-600 md:hidden"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {abierto && (
          <nav className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 md:hidden">
            <EnlacesNav onNavigate={() => setAbierto(false)} />
          </nav>
        )}
      </div>
    </header>
  );
}
