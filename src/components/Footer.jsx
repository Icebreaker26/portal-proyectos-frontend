export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
        <p>© {new Date().getFullYear()} Portal de Proyectos UCP — Universidad Católica de Pereira</p>
        <p className="mt-1">Alejandro Marín Torres · Martín Salazar · Alejandro Jaramillo</p>
      </div>
    </footer>
  );
}
