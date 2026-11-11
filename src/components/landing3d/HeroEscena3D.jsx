import Lienzo3D from './Lienzo3D.jsx';
import EscenaPortal from './EscenaPortal.jsx';

// Fondo puramente estético del hero: la idea de "un portal donde estudiantes y la comunidad
// suben sus proyectos", no el diagrama técnico (ese vive en su propia sección, ver
// SeccionArquitectura.jsx). Se usa como fondo absoluto detrás del título/CTAs.
export default function HeroEscena3D() {
  return (
    <Lienzo3D camera={{ position: [0, 0, 8], fov: 45 }}>
      {(reduceMotion) => <EscenaPortal reduceMotion={reduceMotion} />}
    </Lienzo3D>
  );
}
