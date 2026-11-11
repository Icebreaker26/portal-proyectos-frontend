import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

// navigator.share (hoja nativa de compartir) cuando el navegador la soporta -- sobre todo
// móvil; si no, copia el link al portapapeles con un toast de confirmación. Nunca integra
// redes sociales específicas (fuera de alcance del issue #35).
export default function BotonCompartir({ titulo, texto, url, className }) {
  const compartir = async () => {
    const enlace = url || window.location.href;
    const datos = { title: titulo, text: texto, url: enlace };
    if (navigator.share) {
      try {
        await navigator.share(datos);
      } catch (err) {
        // AbortError: el usuario cerró la hoja de compartir sin elegir nada -- no es un error.
        if (err.name !== 'AbortError') toast.error('No se pudo compartir');
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(enlace);
      toast.success('Link copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el link');
    }
  };

  return (
    <button
      type="button"
      onClick={compartir}
      className={className ?? 'inline-flex items-center gap-1 text-sm text-ucp-verde hover:underline'}
    >
      <Share2 size={14} /> Compartir
    </button>
  );
}
