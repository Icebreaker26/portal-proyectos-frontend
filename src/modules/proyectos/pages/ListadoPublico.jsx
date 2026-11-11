import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Image as ImageIcon, FolderOpen } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import VotoBoton from '../../votos/components/VotoBoton.jsx';
import Skeleton from '../../../components/Skeleton.jsx';
import EmptyState from '../../../components/EmptyState.jsx';

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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {p.imagen_portada_url ? (
                <img src={p.imagen_portada_url} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-slate-50 text-slate-300">
                  <ImageIcon size={28} />
                </div>
              )}

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

                {p.stack?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.stack.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
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
                    <span />
                  )}
                  <VotoBoton proyectoId={p.id} conteoInicial={p.votos} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
