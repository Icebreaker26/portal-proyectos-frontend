import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, ArrowLeft, Paperclip, PlayCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import VotoBoton from '../../votos/components/VotoBoton.jsx';
import CuerpoMarkdown from '../components/CuerpoMarkdown.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
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

// Expediente autenticado de un proyecto (GET /api/proyectos/:id): a diferencia de
// DetalleProyecto.jsx (público, solo aprobado+publico), este trae cualquier proyecto al
// que el usuario tenga acceso (autor, participante, o ya aprobado) e incluye el
// historial de revisiones. Aprobar/rechazar vive AQUÍ y solo aquí — a propósito no hay
// botones de aprobar/rechazar en ListadoProyectos.jsx: el profesor debe entrar al
// expediente completo antes de decidir, no hacerlo desde una fila de tabla.
export default function ExpedienteProyecto() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [comentario, setComentario] = useState('');
  const [confirmandoConsentimiento, setConfirmandoConsentimiento] = useState(false);

  const cargar = () => {
    setCargando(true);
    setNoEncontrado(false);
    apiService
      .get(`/proyectos/${id}`)
      .then(({ data }) => setProyecto(data))
      .catch(() => setNoEncontrado(true))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, [id]);

  const puedeAprobar = usuario?.rol === 'profesor' || usuario?.rol === 'admin';
  const videoId = proyecto?.video_demo_url ? idYoutube(proyecto.video_demo_url) : null;
  // /auth/login y /auth/registro devuelven `id`, pero /auth/me devuelve el payload del JWT
  // (`uuid`) — AuthContext no normaliza el nombre del campo entre ambos casos, así que hay que
  // aceptar los dos para que la comparación funcione también después de recargar la página.
  const miUuid = usuario?.id ?? usuario?.uuid;

  // Issue #18 — fuera de alcance a propósito: retirar el consentimiento (consiente: false) una
  // vez confirmado. El endpoint lo permite, pero no hay un caso de uso claro para deshacerlo desde
  // la UI (el participante ya aceptó que su nombre figure en el proyecto); si surge, es un issue
  // nuevo, no un olvido de este.
  const confirmarConsentimiento = async () => {
    setConfirmandoConsentimiento(true);
    try {
      await apiService.put(`/proyectos/${id}/consentimiento`, { consiente: true });
      toast.success('Consentimiento confirmado');
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo confirmar el consentimiento');
    } finally {
      setConfirmandoConsentimiento(false);
    }
  };

  const cambiarEstado = async (estado, comentarioEnvio) => {
    setActualizando(true);
    try {
      await apiService.put(`/proyectos/${id}/estado`, { estado, comentario: comentarioEnvio || undefined });
      toast.success(estado === 'aprobado' ? 'Proyecto aprobado' : 'Proyecto rechazado');
      setRechazando(false);
      setComentario('');
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo actualizar el proyecto');
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/proyectos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ucp-verde">
        <ArrowLeft size={14} /> Volver a proyectos
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
        <p className="mt-6 text-sm text-slate-500">Este proyecto no existe o no tienes acceso a él.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {proyecto.imagen_portada_url && (
            <img src={proyecto.imagen_portada_url} alt="" className="h-56 w-full object-cover" />
          )}

          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-semibold text-slate-800">{proyecto.titulo}</h1>
              <EstadoBadge estado={proyecto.estado} />
            </div>
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
                    <li key={i} className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span>
                        {p.nombre_cuenta || p.nombre_libre}
                        <span className="text-slate-400"> — {ROLES[p.rol] || p.rol}</span>
                      </span>
                      {p.usuario_uuid && !p.consiente_publicacion && (
                        <>
                          <span className="rounded-full bg-ucp-dorado/10 px-2 py-0.5 text-[11px] text-ucp-dorado">
                            Sin consentir
                          </span>
                          {p.usuario_uuid === miUuid && (
                            <button
                              type="button"
                              disabled={confirmandoConsentimiento}
                              onClick={confirmarConsentimiento}
                              className="rounded-full bg-ucp-verde/10 px-2 py-0.5 text-[11px] font-medium text-ucp-verde hover:bg-ucp-verde/20 disabled:opacity-60"
                            >
                              {confirmandoConsentimiento ? 'Confirmando…' : 'Confirmar mi consentimiento'}
                            </button>
                          )}
                        </>
                      )}
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
                  {proyecto.archivos.map((a) => (
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
                  ))}
                </ul>
              </div>
            )}

            {proyecto.revisiones?.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Historial de revisión</h2>
                <ul className="mt-2 space-y-2">
                  {proyecto.revisiones.map((r, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">{r.estado_nuevo}</span>
                      {r.revisor_nombre && <> por {r.revisor_nombre}</>} · {formatoFecha(r.created_at)}
                      {r.comentario && <p className="mt-0.5 text-slate-500">"{r.comentario}"</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
              <VotoBoton proyectoId={proyecto.id} conteoInicial={proyecto.votos} />
              {proyecto.repositorio_url && (
                <a href={proyecto.repositorio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline">
                  Ver repositorio <ExternalLink size={14} />
                </a>
              )}
              {proyecto.demo_url && (
                <a href={proyecto.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline">
                  Demo en vivo <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Aprobar/rechazar: solo desde aquí, nunca desde la tabla de ListadoProyectos.jsx */}
            {puedeAprobar && proyecto.estado === 'pendiente' && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Decisión</h2>
                {rechazando ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Motivo del rechazo…"
                      rows={3}
                      autoFocus
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ucp-rojo focus:outline-none focus:ring-1 focus:ring-ucp-rojo"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actualizando}
                        onClick={() => cambiarEstado('rechazado', comentario)}
                        className="rounded-lg bg-ucp-rojo/10 px-4 py-2 text-sm font-medium text-ucp-rojo hover:bg-ucp-rojo/20 disabled:opacity-60"
                      >
                        Confirmar rechazo
                      </button>
                      <button type="button" onClick={() => setRechazando(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={actualizando}
                      onClick={() => cambiarEstado('aprobado')}
                      className="inline-flex items-center gap-1 rounded-lg bg-ucp-verde/10 px-4 py-2 text-sm font-medium text-ucp-verde hover:bg-ucp-verde/20 disabled:opacity-60"
                    >
                      <Check size={16} /> Aprobar
                    </button>
                    <button
                      type="button"
                      disabled={actualizando}
                      onClick={() => setRechazando(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-ucp-rojo/10 px-4 py-2 text-sm font-medium text-ucp-rojo hover:bg-ucp-rojo/20 disabled:opacity-60"
                    >
                      <X size={16} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
