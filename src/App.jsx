import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/PublicOnlyRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import NotFound from './pages/NotFound.jsx';
import ListadoPublico from './modules/proyectos/pages/ListadoPublico.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/registro" element={<PublicOnlyRoute><Registro /></PublicOnlyRoute>} />
      <Route path="/proyectos/pub" element={<ListadoPublico />} />

      <Route
        path="/proyectos"
        element={
          <ProtectedRoute>
            <ListadoPublico />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
