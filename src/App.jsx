import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/PublicOnlyRoute.jsx';
import { AdminRoute } from './components/AdminRoute.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import NotFound from './pages/NotFound.jsx';
import ListadoPublico from './modules/proyectos/pages/ListadoPublico.jsx';
import ListadoProyectos from './modules/proyectos/pages/ListadoProyectos.jsx';
import NuevoProyecto from './modules/proyectos/pages/NuevoProyecto.jsx';
import PanelUsuarios from './modules/usuarios/pages/PanelUsuarios.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/registro" element={<PublicOnlyRoute><Registro /></PublicOnlyRoute>} />

      <Route
        path="/proyectos/pub"
        element={
          <Layout>
            <ListadoPublico />
          </Layout>
        }
      />

      <Route
        path="/proyectos"
        element={
          <ProtectedRoute>
            <Layout>
              <ListadoProyectos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/proyectos/nuevo"
        element={
          <ProtectedRoute>
            <Layout>
              <NuevoProyecto />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <PanelUsuarios />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
