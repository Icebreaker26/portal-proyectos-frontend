import { useEffect, useState } from 'react';
import { Paperclip, FileText, FileImage } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService.js';

const MAX_BYTES = 10 * 1024 * 1024;

// Solo PDF/PNG/JPEG/WEBP llegan hasta aquí (el backend los rechaza antes, ver archivosController.js).
const iconoArchivo = (nombreOriginal) => {
  const ext = nombreOriginal.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return FileText;
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return FileImage;
  return Paperclip;
};

// Sube PDF/imágenes a un proyecto ya creado (POST /:id/archivos exige que el proyecto
// exista -- ver archivosController.js en el backend). Se usa después de crear el
// proyecto, nunca antes.
export default function ArchivosProyecto({ proyectoId }) {
  const [archivos, setArchivos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    apiService.get(`/proyectos/${proyectoId}/archivos`).then(({ data }) => setArchivos(data));
  }, [proyectoId]);

  const onSeleccionar = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error('El archivo supera los 10MB');
      return;
    }

    setSubiendo(true);
    const formData = new FormData();
    formData.append('archivo', file);
    try {
      // Sin Content-Type manual: axios/el navegador calculan el boundary correcto del
      // multipart solo si no se fuerza el header aquí.
      const { data } = await apiService.post(`/proyectos/${proyectoId}/archivos`, formData);
      setArchivos((prev) => [...prev, data]);
      toast.success('Archivo subido');
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo subir el archivo');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-ucp-verde hover:text-ucp-verde">
        <Paperclip size={16} />
        {subiendo ? 'Subiendo…' : 'Subir PDF o imagen (máx. 10MB)'}
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={onSeleccionar}
          disabled={subiendo}
        />
      </label>

      {archivos.length > 0 && (
        <ul className="mt-3 space-y-1">
          {archivos.map((a) => {
            const Icono = iconoArchivo(a.nombre_original);
            return (
              <li key={a.id} className="flex items-center gap-2 text-sm text-slate-600">
                <Icono size={14} className="shrink-0 text-slate-400" />
                <span className="truncate">{a.nombre_original}</span>
                <span className="shrink-0 text-xs text-slate-400">({Math.ceil(a.tamano_bytes / 1024)} KB)</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
