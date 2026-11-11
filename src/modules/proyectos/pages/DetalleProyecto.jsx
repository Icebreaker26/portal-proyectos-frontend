import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, ArrowLeft, Paperclip, Lock, PlayCircle } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import VotoBoton from '../../votos/components/VotoBoton.jsx';
import CuerpoMarkdown from '../components/CuerpoMarkdown.jsx';
import Skeleton from '../../../components/Skeleton.jsx';

const formatoFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

const ROLES = { lider: 'Líder', desarrollo: 'Desarrollo', diseno: 'Diseño', investigacion: 'Investigación' };

const idYoutube = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    return null;
  } catch {
    return null;
  }
};

// Actualiza <title> y las meta Open Graph para que compartir el link en redes muestre
// título/resumen/portada en vez del genérico del index.html (ver ADR 0008).
const setMetaOG = (proyecto) => {
  document.title = `${proyecto.titulo} — Portal de Proyectos UCP`;
  const set = (property, content) => {
    if (!content) return;
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };
  set('og:title', proyecto.titulo);
  set('og:description', proyecto.resumen || proyecto.descripcion);
  set('og:image', proyecto.imagen_portada_url);
};

export default function DetalleProyecto() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    setCargando(true);
    setNoEncontrado(false);
    apiService
      .get(`/proyectos/pub/${id}`)
      .then(({ data }) => {
        setProyecto(data);
        setMetaOG(data);
      })
      .catch(() => setNoEncontrado(true))
      .finally(() => setCargando(false));
  }, [id]);

  const videoId = proyecto?.video_demo_url ? idYoutube(proyecto.video_demo_url) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/proyectos/pub" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ucp-verde">
        <ArrowLeft size={14} /> Volver al listado
      </Link>

      {cargando ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <Skeleton className="h-56 w-full rounded-none" />
          <div className="flex flex-col gap-3 p-6">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ) : noEncontrado ? (
        <p className="mt-6 text-sm text-slate-500">Este proyecto no existe o todavía no está aprobado.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {proyecto.imagen_portada_url && (
            <img src={proyecto.imagen_portada_url} alt="" className="h-56 w-full object-cover" />
          )}

          <div className="p-6">
            <h1 className="text-xl font-semibold text-slate-800">{proyecto.titulo}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Por {proyecto.autor_nombre}
              {proyecto.profesor_nombre && <> · Dirigido por {proyecto.profesor_nombre}</>}
              {' · '}{formatoFecha(proyecto.created_at)}
            </p>
            {(proyecto.programa || proyecto.asignatura || proyecto.semestre) && (
              <p className="mt-1 text-xs text-slate-400">
                {[proyecto.programa, proyecto.asignatura, proyecto.semestre].filter(Boolean).join(' · ')}
              </p>
            )}

            {proyecto.resumen && <p className="mt-4 text-sm text-slate-700">{proyecto.resumen}</p>}
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{proyecto.descripcion}</p>
            <CuerpoMarkdown texto={proyecto.cuerpo} />

            {proyecto.stack?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {proyecto.stack.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {proyecto.participantes?.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Participantes</h2>
                <ul className="mt-2 space-y-1">
                  {proyecto.participantes.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      {p.nombre_cuenta || p.nombre_libre}
                      <span className="text-slate-400"> — {ROLES[p.rol] || p.rol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {videoId && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Video demo</h2>
                <div className="mt-2 aspect-video overflow-hidden rounded-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Video demo"
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            {!videoId && proyecto.video_demo_url && (
              <a
                href={proyecto.video_demo_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline"
              >
                <PlayCircle size={14} /> Ver video demo
              </a>
            )}

            {proyecto.archivos?.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Archivos</h2>
                <ul className="mt-2 space-y-1">
                  {proyecto.archivos.map((a) =>
                    usuario ? (
                      <li key={a.id}>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}/proyectos/archivos/${a.id}/descargar`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline"
                        >
                          <Paperclip size={14} /> {a.nombre_original}
                        </a>
                      </li>
                    ) : (
                      <li key={a.id} className="inline-flex items-center gap-1 text-sm text-slate-400">
                        <Lock size={14} /> {a.nombre_original} (inicia sesión para descargar)
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4">
              <VotoBoton proyectoId={proyecto.id} conteoInicial={proyecto.votos} />
              {proyecto.repositorio_url && (
                <a
                  href={proyecto.repositorio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline"
                >
                  Ver repositorio <ExternalLink size={14} />
                </a>
              )}
              {proyecto.demo_url && (
                <a
                  href={proyecto.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline"
                >
                  Demo en vivo <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
