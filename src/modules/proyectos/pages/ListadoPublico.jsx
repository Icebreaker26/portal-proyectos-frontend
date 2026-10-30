import { useEffect, useState } from 'react';
import apiService from '../../../services/apiService.js';

// Estética visual pendiente de definir (issue aparte) — por ahora, marcado funcional sin estilos.
export default function ListadoPublico() {
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    apiService.get('/proyectos/pub').then(({ data }) => setProyectos(data));
  }, []);

  return (
    <div>
      <h1>Proyectos aprobados</h1>
      <ul>
        {proyectos.map((p) => (
          <li key={p.id}>
            <strong>{p.titulo}</strong> — {p.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}
