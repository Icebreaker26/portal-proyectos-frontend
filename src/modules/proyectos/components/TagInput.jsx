import { useState } from 'react';
import { X } from 'lucide-react';

// Chips con Enter/coma para agregar, click en la x para quitar. Usado para stack y
// palabras_clave (arrays de strings en el backend, ver proyectosSchema.js).
export default function TagInput({ value, onChange, placeholder }) {
  const [texto, setTexto] = useState('');

  const agregar = () => {
    const limpio = texto.trim();
    if (!limpio || value.includes(limpio)) {
      setTexto('');
      return;
    }
    onChange([...value, limpio]);
    setTexto('');
  };

  const quitar = (tag) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      agregar();
    }
  };

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 focus-within:border-ucp-verde focus-within:ring-1 focus-within:ring-ucp-verde">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {tag}
          <button type="button" onClick={() => quitar(tag)} className="text-slate-400 hover:text-ucp-rojo">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={agregar}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[80px] flex-1 border-0 p-0.5 text-sm text-slate-800 focus:outline-none focus:ring-0"
      />
    </div>
  );
}
