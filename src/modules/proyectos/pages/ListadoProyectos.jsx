import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FolderOpen } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import EstadoBadge from '../components/EstadoBadge.jsx';
import Skeleton from '../../../components/Skeleton.jsx';
import EmptyState from '../../../components/EmptyState.jsx';

// GET /api/proyectos (autenticado): visibilidad por rol — ver ADR correspondiente en el
// backend (RF-04 del SRS). Quien puede aprobar ve todos; el resto ve lo suyo + lo aprobado
// de otros.
//
// Aprobar/rechazar vive SOLO en el expediente (ExpedienteProyecto.jsx, /proyectos/:id) —
// a propósito no hay acciones en esta tabla: el profesor debe entrar al detalle completo
// del proyecto antes de decidir, no aprobar/rechazar a ciegas desde una fila.
export default function ListadoProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiService
      .get('/proyectos')
      .then(({ data }) => setProyectos(data))
      .finally(() => setCargando(false));
  }, []);

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
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ) : proyectos.length === 0 ? (
        <EmptyState icon={FolderOpen} titulo="Todavía no hay proyectos." />
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Repositorio</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/proyectos/${p.id}`} className="text-slate-800 hover:text-ucp-verde hover:underline">
                        {p.titulo}
                      </Link>
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
