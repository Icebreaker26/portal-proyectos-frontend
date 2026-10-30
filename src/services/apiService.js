import axios from 'axios';

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

apiService.interceptors.response.use(
  (r) => r,
  (err) => {
    // /auth/me se llama al montar la app para saber si hay sesión: un 401 ahí es el caso
    // normal de un visitante sin cuenta, no una sesión expirada — no debe forzar redirect
    // (si lo hiciera, en /landing o /login se entra en bucle de recargas).
    const esChequeoDeSesion = err.config?.url?.includes('/auth/me');

    // Solo 401 (sesión inválida/expirada) fuerza logout. Un 403 significa que la sesión
    // ES válida pero falta un permiso puntual — redirigir a /landing ahí es un bug real:
    // si /landing manda a un usuario autenticado de vuelta a una ruta que le da 403
    // (PublicOnlyRoute hace esto), la recarga completa vuelve a /landing y el ciclo se
    // repite sin parar. Un 403 lo maneja el componente que hizo la llamada, no aquí.
    if (!esChequeoDeSesion && err.response?.status === 401) {
      window.location.href = '/landing';
    }
    return Promise.reject(err);
  },
);

export default apiService;
