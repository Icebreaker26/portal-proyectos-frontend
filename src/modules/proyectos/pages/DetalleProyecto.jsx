import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import VotoBoton from '../../votos/components/VotoBoton.jsx';

const formatoFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

export default function DetalleProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    setCargando(true);
    setNoEncontrado(false);
    apiService
      .get(`/proyectos/pub/${id}`)
      .then(({ data }) => setProyecto(data))
      .catch(() => setNoEncontrado(true))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/proyectos/pub" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ucp-verde">
        <ArrowLeft size={14} /> Volver al listado
      </Link>

      {cargando ? (
        <p className="mt-6 text-sm text-slate-500">Cargando…</p>
      ) : noEncontrado ? (
        <p className="mt-6 text-sm text-slate-500">Este proyecto no existe o todavía no está aprobado.</p>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">{proyecto.titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Por {proyecto.autor_nombre} · {formatoFecha(proyecto.created_at)}
          </p>

          <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{proyecto.descripcion}</p>

          <div className="mt-6 flex items-center gap-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
