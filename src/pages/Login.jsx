import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const inputClase =
  'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await login(email, password);
      navigate('/proyectos');
    } catch (err) {
      // El backend siempre responde 401 con este mensaje para credenciales inválidas (nunca
      // distingue "email no existe" de "contraseña incorrecta", a propósito -- ver authService.js);
      // igual se lee err.response?.data?.error por si algún día hay otro código (400 de Zod, 429...).
      toast.error(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-ucp-verde hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-slate-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
            className={inputClase}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90 disabled:opacity-60"
        >
          {enviando && <Loader2 size={14} className="animate-spin" />}
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
