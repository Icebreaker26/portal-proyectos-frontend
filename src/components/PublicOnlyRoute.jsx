import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const PublicOnlyRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (usuario) return <Navigate to="/proyectos" replace />;

  return children;
};
