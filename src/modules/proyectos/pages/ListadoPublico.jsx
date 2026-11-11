import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, FolderOpen, Search } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import VotoBoton from '../../votos/components/VotoBoton.jsx';
import Skeleton from '../../../components/Skeleton.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import Cascada, { item } from '../../../components/Cascada.jsx';
import FallbackEstatico from '../../../components/landing3d/FallbackEstatico.jsx';

// Chunk de three.js + @react-three/fiber: igual que en Landing.jsx, debe ser lazy para no
// meterlo en el bundle principal de rutas que no muestran esta vitrina (issue #39).
const HeroVitrina3D = lazy(() => import('../../../components/landing3d/HeroVitrina3D.jsx'));

const MAX_STACK_VISIBLE = 3;
const selectClase =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde';
const TIPO_LABEL = { investigacion: 'Investigación', aplicativo: 'Aplicativo', trabajo_de_grado: 'Trabajo de grado', otro: 'Otro' };

// /proyectos/pub (esta vista, pública, sin sesión) vs /proyectos (ListadoProyectos.jsx,
// autenticado, "lo propio + lo aprobado de otros") — ver issue #33: la diferencia entre ambas
// no era obvia desde la navegación, de ahí el cross-link de abajo cuando hay sesión.
export default function ListadoPublico() {
  const { usuario } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [programaFiltro, setProgramaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  useEffect(() => {
    apiService
      .get('/proyectos/pub')
      .then(({ data }) => setProyectos(data))
      .finally(() => setCargando(false));
  }, []);

  // Filtro en el cliente (issue #34): GET /api/proyectos/pub no pagina ni filtra, y no hace
  // falta tocar el backend para esto -- mismo criterio que el buscador de PanelUsuarios.jsx (#23).
  const programas = useMemo(
    () => [...new Set(proyectos.map((p) => p.programa).filter(Boolean))].sort(),
    [proyectos],
  );
  const tipos = useMemo(
    () => [...new Set(proyectos.map((p) => p.tipo_proyecto).filter(Boolean))].sort(),
    [proyectos],
  );
  const proyectosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return proyectos.filter((p) => {
      if (programaFiltro && p.programa !== programaFiltro) return false;
      if (tipoFiltro && p.tipo_proyecto !== tipoFiltro) return false;
      if (!q) return true;
      const texto = [p.titulo, p.resumen, p.descripcion, ...(p.stack || [])].join(' ').toLowerCase();
      return texto.includes(q);
    });
  }, [proyectos, busqueda, programaFiltro, tipoFiltro]);
  const hayFiltrosActivos = Boolean(busqueda || programaFiltro || tipoFiltro);

  return (
    <div>
      {/* Hero 3D propio de esta vista (issue #39): mismo patrón que /landing (fondo 3D
          puramente estético detrás de una tarjeta de texto en HTML normal), pero contenido en
          el ancho del Layout en vez de a todo el viewport, y con otra escena (EscenaInnovacion,
          no el "portal" de landing) — íconos de ingeniería/ciencias flotando alrededor de un
          núcleo facetado, para dar la idea de innovación de la Facultad de Ciencias Básicas e
          Ingeniería. */}
      <div className="relative mb-8 min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 sm:min-h-[22rem]">
        <div className="absolute inset-0">
          <Suspense fallback={<FallbackEstatico />}>
            <HeroVitrina3D />
          </Suspense>
        </div>

        <div className="relative z-10 flex h-full flex-col items-start justify-center gap-2 p-6 sm:p-10">
          <div className="max-w-xl rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-ucp-granate">Vitrina pública</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
              La innovación de la Facultad de Ciencias Básicas e Ingeniería, en marcha
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Explora los proyectos de estudiantes y profesores de la UCP, aprobados y listos para
              inspirar — abierto a cualquier visitante, con o sin sesión.
            </p>
            {usuario && (
              <Link to="/proyectos" className="mt-3 inline-block text-sm font-medium text-ucp-verde hover:underline">
                Ver mis proyectos →
              </Link>
            )}
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
              placeholder="Buscar por título, resumen o tecnología…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
            />
          </div>
          {programas.length > 1 && (
            <select value={programaFiltro} onChange={(e) => setProgramaFiltro(e.target.value)} className={selectClase}>
              <option value="">Todos los programas</option>
              {programas.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
          {tipos.length > 1 && (
            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className={selectClase}>
              <option value="">Todos los tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{TIPO_LABEL[t] || t}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {cargando ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : proyectos.length === 0 ? (
        <EmptyState icon={FolderOpen} titulo="Todavía no hay proyectos aprobados." />
      ) : proyectosFiltrados.length === 0 ? (
        <EmptyState icon={Search} titulo="Sin resultados para ese filtro.">
          {hayFiltrosActivos && 'Prueba con otro término o quita algún filtro.'}
        </EmptyState>
      ) : (
        <Cascada className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {proyectosFiltrados.map((p) => {
            const stackVisible = p.stack?.slice(0, MAX_STACK_VISIBLE) ?? [];
            const stackRestantes = (p.stack?.length ?? 0) - stackVisible.length;
            return (
              <motion.article
                key={p.id}
                variants={item}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
                  {p.imagen_portada_url ? (
                    <img
                      src={p.imagen_portada_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon size={28} />
                    </div>
                  )}

                  <div className="absolute right-2 top-2 rounded-full bg-white/90 p-0.5 shadow-sm backdrop-blur-sm">
                    <VotoBoton proyectoId={p.id} conteoInicial={p.votos} />
                  </div>

                  {stackVisible.length > 0 && (
                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                      {stackVisible.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-slate-700">
                          {tag}
                        </span>
                      ))}
                      {stackRestantes > 0 && (
                        <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-slate-700">
                          +{stackRestantes}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <Link to={`/proyectos/pub/${p.id}`} className="font-medium text-slate-800 hover:text-ucp-verde hover:underline">
                    {p.titulo}
                  </Link>
                  {(p.programa || p.tipo_proyecto) && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[p.programa, p.tipo_proyecto].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="mt-2 flex-1 text-sm text-slate-600">{p.resumen || p.descripcion}</p>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    {p.repositorio_url ? (
                      <a
                        href={p.repositorio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline"
                      >
                        Repo <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">Sin repositorio público</span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </Cascada>
      )}
    </div>
  );
}
