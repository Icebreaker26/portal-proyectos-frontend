import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, AlertTriangle, FolderOpen, Lock, Search } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import EstadoBadge from '../components/EstadoBadge.jsx';
import Skeleton from '../../../components/Skeleton.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import FallbackEstatico from '../../../components/landing3d/FallbackEstatico.jsx';

// Mismo hero 3D que ListadoPublico.jsx (issue #39): un dashboard privado justo después de la
// vitrina pública no debería sentirse como un salto hacia atrás en identidad visual. Se reutiliza
// la escena (EscenaInnovacion) — es el mismo laboratorio de la facultad, solo que aquí la tarjeta
// de texto deja explícito que esta vista es privada (ver eyebrow con el ícono de candado abajo).
const HeroVitrina3D = lazy(() => import('../../../components/landing3d/HeroVitrina3D.jsx'));

const selectClase =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde';

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
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  useEffect(() => {
    apiService
      .get('/proyectos')
      .then(({ data }) => setProyectos(data))
      .finally(() => setCargando(false));
  }, []);

  // Filtro en el cliente (issue #34), mismo criterio que ListadoPublico.jsx: GET /api/proyectos
  // no pagina ni filtra, y filtrar sobre los datos ya traídos no justifica tocar el backend.
  const proyectosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return proyectos.filter((p) => {
      if (estadoFiltro && p.estado !== estadoFiltro) return false;
      if (!q) return true;
      const texto = [p.titulo, p.resumen, p.descripcion].filter(Boolean).join(' ').toLowerCase();
      return texto.includes(q);
    });
  }, [proyectos, busqueda, estadoFiltro]);
  const hayFiltrosActivos = Boolean(busqueda || estadoFiltro);

  return (
    <div>
      {/* Hero 3D (issue #39, reutilizado aquí): misma escena que la vitrina pública, pero la
          tarjeta deja explícito que esta vista es privada (candado + "solo para ti"). */}
      <div className="relative mb-8 min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 sm:min-h-[22rem]">
        <div className="absolute inset-0">
          <Suspense fallback={<FallbackEstatico />}>
            <HeroVitrina3D />
          </Suspense>
        </div>

        <div className="relative z-10 flex h-full flex-col items-start justify-center gap-2 p-6 sm:p-10">
          <div className="max-w-xl rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-7">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ucp-granate">
              <Lock size={12} /> Mis proyectos · vista privada
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
              Tu rincón en la innovación de la Facultad de Ciencias Básicas e Ingeniería
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tus proyectos en cualquier estado y los ya aprobados de otros — visible solo para ti,
              con tu sesión iniciada. ¿Buscas la{' '}
              <Link to="/proyectos/pub" className="font-medium text-ucp-verde hover:underline">
                vitrina pública
              </Link>?
            </p>
            <Link
              to="/proyectos/nuevo"
              className="mt-4 inline-block rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90"
            >
              Nuevo proyecto
            </Link>
          </div>
        </div>
      </div>

      {!cargando && proyectos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título o resumen…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
            />
          </div>
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className={selectClase}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
      )}

      {cargando ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ) : proyectos.length === 0 ? (
        <EmptyState icon={FolderOpen} titulo="Todavía no hay proyectos." />
      ) : proyectosFiltrados.length === 0 ? (
        <EmptyState icon={Search} titulo="Sin resultados para ese filtro.">
          {hayFiltrosActivos && 'Prueba con otro término o quita algún filtro.'}
        </EmptyState>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                {proyectosFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-t border-slate-100 transition-colors hover:bg-slate-50 ${p.requiere_mi_consentimiento ? 'bg-ucp-dorado/5 hover:bg-ucp-dorado/10' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/proyectos/${p.id}`} className="text-slate-800 hover:text-ucp-verde hover:underline">
                        {p.titulo}
                      </Link>
                      {p.requiere_mi_consentimiento && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-ucp-dorado/10 px-2 py-0.5 text-[11px] font-normal text-ucp-dorado">
                          <AlertTriangle size={11} /> Requiere tu consentimiento
                        </span>
                      )}
                      {(p.programa || p.tipo_proyecto) && (
                        <p className="mt-0.5 text-xs font-normal text-slate-400">
                          {[p.programa, p.tipo_proyecto].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-600">{p.resumen || p.descripcion}</td>
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
