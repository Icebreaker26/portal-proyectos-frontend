import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, FolderOpen } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import VotoBoton from '../../votos/components/VotoBoton.jsx';
import Skeleton from '../../../components/Skeleton.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import Cascada, { item } from '../../../components/Cascada.jsx';

const MAX_STACK_VISIBLE = 3;

export default function ListadoPublico() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiService
      .get('/proyectos/pub')
      .then(({ data }) => setProyectos(data))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Proyectos aprobados</h1>
      <p className="mt-1 text-sm text-slate-500">
        Proyectos de curso publicados por estudiantes y profesores de la UCP.
      </p>

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
      ) : (
        <Cascada className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => {
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
