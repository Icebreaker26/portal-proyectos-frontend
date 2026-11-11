import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Search, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import Skeleton from '../../../components/Skeleton.jsx';
import EmptyState from '../../../components/EmptyState.jsx';

const ROL_ESTILOS = {
  estudiante: { clase: 'bg-slate-100 text-slate-600', icon: GraduationCap },
  profesor: { clase: 'bg-ucp-verde/10 text-ucp-verde', icon: BookOpen },
  admin: { clase: 'bg-ucp-granate/10 text-ucp-granate', icon: ShieldCheck },
};

function RolBadge({ rol }) {
  const { clase, icon: Icon } = ROL_ESTILOS[rol] || { clase: 'bg-slate-100 text-slate-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${clase}`}>
      {Icon && <Icon size={12} />}
      {rol}
    </span>
  );
}

// Admin-only (ver AdminRoute.jsx). El backend solo acepta 'estudiante'/'profesor' por
// esta vía — 'admin' sigue siendo manual en BD (ver ADR 0006 en el repo backend).
export default function PanelUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    apiService
      .get('/usuarios')
      .then(({ data }) => setUsuarios(data))
      .finally(() => setCargando(false));
  }, []);

  // Filtro en el cliente -- GET /api/usuarios no pagina ni filtra (fuera de alcance del issue),
  // pero la lista completa de usuarios activos no debería ser tan grande como para justificar
  // un query param nuevo todavía.
  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [usuarios, busqueda]);

  const cambiarRol = async (id, rol) => {
    setActualizando(id);
    setConfirmando(null);
    try {
      await apiService.put(`/usuarios/${id}/rol`, { rol });
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, rol } : u)));
      toast.success(`Ahora es ${rol}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo actualizar el rol');
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Usuarios</h1>
      <p className="mt-1 text-sm text-slate-500">
        Promover a profesor o devolver a estudiante. El rol admin se asigna manual en la base de datos.
      </p>

      {!cargando && usuarios.length > 0 && (
        <div className="relative mt-4 max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
          />
        </div>
      )}

      {cargando ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ) : usuarios.length === 0 ? (
        <EmptyState icon={Users} titulo="No hay usuarios." />
      ) : usuariosFiltrados.length === 0 ? (
        <EmptyState icon={Search} titulo={`Sin resultados para "${busqueda}".`} />
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => {
                  const rolDestino = u.rol === 'profesor' ? 'estudiante' : 'profesor';
                  const pidiendoConfirmacion = confirmando === u.id;
                  return (
                    <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{u.nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <RolBadge rol={u.rol} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {u.rol === 'admin' ? (
                          <span className="text-slate-400">—</span>
                        ) : pidiendoConfirmacion ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">¿Cambiar a {rolDestino}?</span>
                            <button
                              type="button"
                              disabled={actualizando === u.id}
                              onClick={() => cambiarRol(u.id, rolDestino)}
                              className="rounded-lg bg-ucp-verde/10 px-2.5 py-1 text-xs font-medium text-ucp-verde hover:bg-ucp-verde/20 disabled:opacity-60"
                            >
                              {actualizando === u.id ? 'Guardando…' : 'Confirmar'}
                            </button>
                            <button type="button" onClick={() => setConfirmando(null)} className="text-xs text-slate-500 hover:underline">
                              Cancelar
                            </button>
                          </div>
                        ) : u.rol === 'profesor' ? (
                          <button
                            type="button"
                            onClick={() => setConfirmando(u.id)}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                          >
                            Volver a estudiante
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmando(u.id)}
                            className="rounded-lg bg-ucp-verde/10 px-2.5 py-1 text-xs font-medium text-ucp-verde transition-colors hover:bg-ucp-verde/20"
                          >
                            Promover a profesor
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
