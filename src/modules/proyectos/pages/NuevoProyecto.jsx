import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService.js';

// Backend valida lo mismo en crearSchema (proyectosSchema.js): titulo y descripcion
// obligatorios, repositorio_url opcional (debe ser URL si se manda).
export default function NuevoProyecto() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [repositorioUrl, setRepositorioUrl] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await apiService.post('/proyectos', {
        titulo,
        descripcion,
        repositorio_url: repositorioUrl || undefined,
      });
      toast.success('Proyecto enviado — queda pendiente de aprobación');
      navigate('/proyectos');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo crear el proyecto';
      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-semibold text-slate-800">Nuevo proyecto</h1>
      <p className="mt-1 text-sm text-slate-500">
        Queda en estado "pendiente" hasta que un profesor lo apruebe.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="titulo" className="block text-xs font-medium text-slate-600">
            Título
          </label>
          <input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-xs font-medium text-slate-600">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
          />
        </div>

        <div>
          <label htmlFor="repositorio" className="block text-xs font-medium text-slate-600">
            Repositorio (opcional)
          </label>
          <input
            id="repositorio"
            type="url"
            value={repositorioUrl}
            onChange={(e) => setRepositorioUrl(e.target.value)}
            placeholder="https://github.com/usuario/proyecto"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link to="/proyectos" className="text-sm text-slate-500 hover:text-slate-700">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90 disabled:opacity-60"
          >
            {enviando ? 'Enviando…' : 'Enviar proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
