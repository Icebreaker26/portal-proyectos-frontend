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
    if (!esChequeoDeSesion && [401, 403].includes(err.response?.status)) {
      window.location.href = '/landing';
    }
    return Promise.reject(err);
  },
);

export default apiService;
