import { Link } from 'react-router-dom';
import Footer from './Footer.jsx';

// Layout para páginas de pre-sesión (Login, Registro): tarjeta centrada, sin el navbar
// completo de la app (todavía no hay sesión ni rutas que navegar). Reutiliza la franja
// institucional segmentada del ADR 0007.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <div className="flex h-1" aria-hidden="true">
        <div className="flex-1 bg-ucp-granate" />
        <div className="flex-1 bg-ucp-verde" />
        <div className="flex-1 bg-ucp-dorado" />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12">
        <Link to="/landing" className="mb-8 text-lg font-semibold text-slate-800">
          Portal de Proyectos <span className="text-ucp-granate">UCP</span>
        </Link>

        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-4 text-sm text-slate-500">{footer}</div>}
      </div>

      <Footer />
    </div>
  );
}
