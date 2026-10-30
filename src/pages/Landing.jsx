import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <div className="flex h-1" aria-hidden="true">
        <div className="flex-1 bg-ucp-granate" />
        <div className="flex-1 bg-ucp-verde" />
        <div className="flex-1 bg-ucp-dorado" />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-3xl font-semibold text-slate-800">
          Portal de Proyectos <span className="text-ucp-granate">UCP</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-500">
          Estudiantes suben proyectos, profesores los aprueban y la comunidad vota.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="rounded-lg bg-ucp-verde px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Crear cuenta
          </Link>
        </div>

        <Link to="/proyectos/pub" className="mt-6 text-sm text-slate-500 hover:text-ucp-verde hover:underline">
          Ver proyectos públicos
        </Link>
      </div>

      <Footer />
    </div>
  );
}
