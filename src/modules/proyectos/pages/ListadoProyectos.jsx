import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';

// GET /api/proyectos (autenticado): visibilidad por rol — ver ADR correspondiente en el
// backend (RF-04 del SRS). Quien puede aprobar ve todos; el resto ve lo suyo + lo aprobado
// de otros.
//
// Aprobar/rechazar (PUT /api/proyectos/:id/estado) exige el permiso APROBAR, que solo
// profesor/admin reciben por defecto (permisosDefaultService.js en el backend). Un
// estudiante nunca ve los botones, pero el backend es quien hace cumplir la regla —
// este chequeo de rol es solo para no mostrar acciones que igual fallarían con 403.
const PUEDE_APROBAR = (usuario) => usuario?.rol === 'profesor' || usuario?.rol === 'admin';

export default function ListadoProyectos() {
  const { usuario } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(null);
  const [rechazandoId, setRechazandoId] = useState(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    apiService
      .get('/proyectos')
      .then(({ data }) => setProyectos(data))
      .finally(() => setCargando(false));
  }, []);

  const cambiarEstado = async (id, estado, comentarioEnvio) => {
    setActualizando(id);
    try {
      await apiService.put(`/proyectos/${id}/estado`, { estado, comentario: comentarioEnvio || undefined });
      setProyectos((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
      toast.success(estado === 'aprobado' ? 'Proyecto aprobado' : 'Proyecto rechazado');
      setRechazandoId(null);
      setComentario('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo actualizar el proyecto');
    } finally {
      setActualizando(null);
    }
  };

  const puedeAprobar = PUEDE_APROBAR(usuario);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Proyectos</h1>
          <p className="mt-1 text-sm text-slate-500">Tus proyectos y los ya aprobados de otros.</p>
        </div>
        <Link
          to="/proyectos/nuevo"
          className="rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90"
        >
          Nuevo proyecto
        </Link>
      </div>

      {cargando ? (
        <p className="mt-6 text-sm text-slate-500">Cargando…</p>
      ) : proyectos.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Todavía no hay proyectos.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Repositorio</th>
                  {puedeAprobar && <th className="px-4 py-3">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {p.titulo}
                      {(p.programa || p.tipo_proyecto) && (
                        <p className="mt-0.5 text-xs font-normal text-slate-400">
                          {[p.programa, p.tipo_proyecto].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.resumen || p.descripcion}</td>
                    <td className="px-4 py-3 text-sm">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.repositorio_url ? (
                        <a
                          href={p.repositorio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-ucp-verde hover:underline"
                        >
                          Ver <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    {puedeAprobar && (
                      <td className="px-4 py-3 text-sm">
                        {p.estado !== 'pendiente' ? (
                          <span className="text-slate-400">—</span>
                        ) : rechazandoId === p.id ? (
                          <div className="flex min-w-[220px] flex-col gap-2">
                            <textarea
                              value={comentario}
                              onChange={(e) => setComentario(e.target.value)}
                              placeholder="Motivo del rechazo…"
                              rows={2}
                              autoFocus
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-ucp-rojo focus:outline-none focus:ring-1 focus:ring-ucp-rojo"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={actualizando === p.id}
                                onClick={() => cambiarEstado(p.id, 'rechazado', comentario)}
                                className="rounded-lg bg-ucp-rojo/10 px-2.5 py-1 text-xs font-medium text-ucp-rojo hover:bg-ucp-rojo/20 disabled:opacity-60"
                              >
                                Confirmar rechazo
                              </button>
                              <button
                                type="button"
                                onClick={() => { setRechazandoId(null); setComentario(''); }}
                                className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={actualizando === p.id}
                              onClick={() => cambiarEstado(p.id, 'aprobado')}
                              className="inline-flex items-center gap-1 rounded-lg bg-ucp-verde/10 px-2.5 py-1 text-xs font-medium text-ucp-verde transition-colors hover:bg-ucp-verde/20 disabled:opacity-60"
                            >
                              <Check size={14} /> Aprobar
                            </button>
                            <button
                              type="button"
                              disabled={actualizando === p.id}
                              onClick={() => { setRechazandoId(p.id); setComentario(''); }}
                              className="inline-flex items-center gap-1 rounded-lg bg-ucp-rojo/10 px-2.5 py-1 text-xs font-medium text-ucp-rojo transition-colors hover:bg-ucp-rojo/20 disabled:opacity-60"
                            >
                              <X size={14} /> Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    )}
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
