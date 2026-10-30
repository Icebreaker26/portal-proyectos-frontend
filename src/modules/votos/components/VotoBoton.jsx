import { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService.js';
import { useAuth } from '../../../context/AuthContext.jsx';

// El backend no expone "¿ya voté este proyecto?" (solo el conteo público y un
// POST/DELETE idempotentes — un usuario no puede tener más de un voto activo por
// proyecto, lo hace cumplir el UNIQUE(usuario_uuid, proyecto_id) + upsert en
// votosService.js). Por eso "votado" es solo estado optimista de esta sesión del
// navegador: no persiste entre recargas, pero votar/retirar siempre queda correcto
// en el servidor porque las dos operaciones son idempotentes.
export default function VotoBoton({ proyectoId }) {
  const { usuario } = useAuth();
  const [conteo, setConteo] = useState(null);
  const [votado, setVotado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    apiService.get(`/votos/pub/${proyectoId}/conteo`).then(({ data }) => setConteo(data.total));
  }, [proyectoId]);

  const alternarVoto = async () => {
    setEnviando(true);
    try {
      if (votado) {
        await apiService.delete(`/votos/${proyectoId}`);
        setConteo((c) => Math.max(0, c - 1));
        setVotado(false);
      } else {
        await apiService.post('/votos', { proyecto_id: proyectoId });
        setConteo((c) => c + 1);
        setVotado(true);
      }
    } catch {
      toast.error('No se pudo registrar el voto');
    } finally {
      setEnviando(false);
    }
  };

  if (!usuario) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
        <ThumbsUp size={14} /> {conteo ?? '—'}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={enviando}
      onClick={alternarVoto}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors disabled:opacity-60 ${
        votado ? 'bg-ucp-verde text-white hover:bg-ucp-verde/90' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <ThumbsUp size={14} /> {conteo ?? '—'}
    </button>
  );
}
