import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from './Footer.jsx';

// Manchas de color institucional desenfocadas (CSS puro, sin <Canvas>/three.js — a propósito
// más liviano que el hero 3D de /landing, para no pagar ese chunk en una página de login/
// registro) que emparientan visualmente esta pantalla con la landing sin repetir su costo.
function FondoDecorativo() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ucp-granate/10 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-ucp-verde/10 blur-3xl" />
      <div className="absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-ucp-dorado/10 blur-3xl" />
    </div>
  );
}

// Layout para páginas de pre-sesión (Login, Registro): tarjeta centrada, sin el navbar
// completo de la app (todavía no hay sesión ni rutas que navegar). Reutiliza la franja
// institucional segmentada del ADR 0007.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F7F8FA]">
      <div className="flex h-1" aria-hidden="true">
        <div className="flex-1 bg-ucp-granate" />
        <div className="flex-1 bg-ucp-verde" />
        <div className="flex-1 bg-ucp-dorado" />
      </div>

      <FondoDecorativo />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12">
        <Link to="/landing" className="mb-8 text-lg font-semibold text-slate-800">
          Portal de Proyectos <span className="text-ucp-granate">UCP</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
        >
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </motion.div>

        {footer && <div className="mt-4 text-sm text-slate-500">{footer}</div>}
      </div>

      <Footer />
    </div>
  );
}
