import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import VotoBoton from '../../votos/components/VotoBoton.jsx';

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
        <p className="mt-6 text-sm text-slate-500">Cargando…</p>
      ) : proyectos.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Todavía no hay proyectos aprobados.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Repositorio</th>
                  <th className="px-4 py-3">Votos</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/proyectos/pub/${p.id}`} className="text-slate-800 hover:text-ucp-verde hover:underline">
                        {p.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.descripcion}</td>
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
                    <td className="px-4 py-3 text-sm">
                      <VotoBoton proyectoId={p.id} conteoInicial={p.votos} />
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
