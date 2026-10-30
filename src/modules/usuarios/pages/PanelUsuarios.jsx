import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService.js';

// Admin-only (ver AdminRoute.jsx). El backend solo acepta 'estudiante'/'profesor' por
// esta vía — 'admin' sigue siendo manual en BD (ver ADR 0006 en el repo backend).
export default function PanelUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    apiService
      .get('/usuarios')
      .then(({ data }) => setUsuarios(data))
      .finally(() => setCargando(false));
  }, []);

  const cambiarRol = async (id, rol) => {
    setActualizando(id);
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

      {cargando ? (
        <p className="mt-6 text-sm text-slate-500">Cargando…</p>
      ) : usuarios.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No hay usuarios.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{u.nombre}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{u.rol}</td>
                    <td className="px-4 py-3 text-sm">
                      {u.rol === 'admin' ? (
                        <span className="text-slate-400">—</span>
                      ) : u.rol === 'profesor' ? (
                        <button
                          type="button"
                          disabled={actualizando === u.id}
                          onClick={() => cambiarRol(u.id, 'estudiante')}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60"
                        >
                          Volver a estudiante
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actualizando === u.id}
                          onClick={() => cambiarRol(u.id, 'profesor')}
                          className="rounded-lg bg-ucp-verde/10 px-2.5 py-1 text-xs font-medium text-ucp-verde transition-colors hover:bg-ucp-verde/20 disabled:opacity-60"
                        >
                          Promover a profesor
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
