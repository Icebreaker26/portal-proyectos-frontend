import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <h1>Portal de Proyectos UCP</h1>
      <p>Estudiantes suben proyectos, profesores los aprueban y la comunidad vota.</p>
      <Link to="/login">Iniciar sesión</Link>
      <Link to="/registro">Crear cuenta</Link>
      <Link to="/proyectos/pub">Ver proyectos públicos</Link>
    </div>
  );
}
