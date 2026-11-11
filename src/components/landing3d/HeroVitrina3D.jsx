import Lienzo3D from './Lienzo3D.jsx';
import EscenaInnovacion from './EscenaInnovacion.jsx';

// Fondo puramente estético del hero de /proyectos/pub (issue #39): la idea de que la Facultad de
// Ciencias Básicas e Ingeniería está construyendo innovación en varios frentes a la vez, no el
// diagrama técnico ni el "portal" de /landing (ese vive en HeroEscena3D.jsx/EscenaPortal.jsx) —
// escena propia (EscenaInnovacion), aunque comparte utilidades/paleta con esa carpeta.
export default function HeroVitrina3D() {
  return (
    <Lienzo3D camera={{ position: [0, 0, 8], fov: 45 }}>
      {(reduceMotion) => <EscenaInnovacion reduceMotion={reduceMotion} />}
    </Lienzo3D>
  );
}
