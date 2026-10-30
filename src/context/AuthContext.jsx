import { createContext, useContext, useEffect, useState } from 'react';
import apiService from '../services/apiService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarSesion = async () => {
    try {
      const { data } = await apiService.get('/auth/me');
      setUsuario(data);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarSesion(); }, []);

  const login = async (email, password) => {
    const { data } = await apiService.post('/auth/login', { email, password });
    setUsuario(data);
    return data;
  };

  const registrar = async (nombre, email, password) => {
    const { data } = await apiService.post('/auth/registro', { nombre, email, password });
    setUsuario(data);
    return data;
  };

  const logout = async () => {
    await apiService.post('/auth/logout');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
