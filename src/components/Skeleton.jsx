// Placeholder de carga genérico (shimmer/pulse con Tailwind) — cierra el ADR 0009: reemplaza el
// "Cargando…" en texto plano por una forma que anticipa el contenido real. `className` define
// tamaño/forma (alto, ancho, rounded-full para un avatar, etc.); el componente solo aporta el
// fondo y la animación.
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} aria-hidden="true" />;
}
