import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import FallbackEstatico from './FallbackEstatico.jsx';
import LimiteErrorEscena from './LimiteErrorEscena.jsx';

function hayWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

// Host genérico de un <Canvas> de @react-three/fiber: detecta soporte de WebGL y
// `prefers-reduced-motion`, y cae a un fondo estático si no hay soporte o la escena falla.
// `children` es una función (reduceMotion) => <Escena .../> para que cada escena decida qué
// animar según esa bandera. Llena 100% del contenedor que le dé el padre (no se posiciona a sí
// mismo: el que lo usa decide si va de fondo absoluto o como bloque normal en el flujo).
export default function Lienzo3D({ camera, children }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [soportaWebGL, setSoportaWebGL] = useState(true);

  useEffect(() => {
    setSoportaWebGL(hayWebGL());

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(media.matches);
    const onChange = (e) => setReduceMotion(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (!soportaWebGL) return <FallbackEstatico />;

  return (
    <LimiteErrorEscena>
      <Canvas dpr={[1, 1.5]} camera={camera} gl={{ antialias: true, alpha: true }}>
        {children(reduceMotion)}
      </Canvas>
    </LimiteErrorEscena>
  );
}
