import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const inputClase =
  'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde';

// Registro disponible solo con correo institucional @ucp.edu.co (ver ADR 0006 en el repo backend).
// Siempre crea rol 'estudiante'; la promoción a 'profesor' es manual por ahora.
export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await registrar(nombre, email, password);
      navigate('/proyectos');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo completar el registro';
      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Solo con correo institucional (@ucp.edu.co). Se registra como estudiante."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-ucp-verde hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-xs font-medium text-slate-600">
            Nombre completo
          </label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className={inputClase}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-slate-600">
            Correo institucional
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ucp.edu.co"
            required
            className={inputClase}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-slate-600">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mín. 8 caracteres"
            minLength={8}
            required
            className={inputClase}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90 disabled:opacity-60"
        >
          {enviando ? 'Creando…' : 'Registrarme'}
        </button>
      </form>
    </AuthLayout>
  );
}
