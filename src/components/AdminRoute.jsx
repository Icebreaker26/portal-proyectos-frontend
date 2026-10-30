import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Para usar DESPUÉS de ProtectedRoute (asume que ya hay sesión). Si el usuario no es
// admin, lo manda a /proyectos en vez de exponer la ruta como "no existe": el backend
// de todas formas la rechazaría con 403, así que no hay nada que ocultar.
export const AdminRoute = ({ children }) => {
  const { usuario } = useAuth();

  if (usuario?.rol !== 'admin') return <Navigate to="/proyectos" replace />;

  return children;
};
