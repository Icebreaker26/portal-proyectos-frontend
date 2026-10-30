import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

// Registro disponible solo con correo institucional @ucp.edu.co (ver ADR 0006 en el repo backend).
// Siempre crea rol 'estudiante'; la promoción a 'profesor' es manual por ahora.
export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrar(nombre, email, password);
      navigate('/proyectos');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo completar el registro';
      toast.error(mensaje);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Crear cuenta</h1>
      <p>Solo con correo institucional (@ucp.edu.co). Se registra como estudiante.</p>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ucp.edu.co" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mín. 8 caracteres)" minLength={8} required />
      <button type="submit">Registrarme</button>
      <Link to="/login">Ya tengo cuenta</Link>
    </form>
  );
}
