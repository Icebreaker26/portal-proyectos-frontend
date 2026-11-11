import { lazy, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThree } from '@react-three/fiber';
import Lienzo3D from './Lienzo3D.jsx';
import FallbackEstatico from './FallbackEstatico.jsx';

const EscenaArquitectura = lazy(() => import('./EscenaArquitectura.jsx'));

// El diagrama mide ~15 unidades de ancho (usuario -> db + las cajas de host/red). La cámara fija
// de más abajo (z=9) ya se ve bien en desktop, pero en pantallas angostas (el contenedor es alto
// y fijo, min-h, así que el aspect ratio se achica) ese mismo encuadre corta los bordes. Esta
// pieza no dibuja nada: solo aleja la cámara cuando el aspect ratio del lienzo se vuelve angosto,
// para que el ancho completo del diagrama siga entrando en cuadro.
function CamaraResponsiva({ medioAnchoObjetivo = 7.5, distanciaMinima = 9 }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspecto = size.width / size.height;
    const fovRad = (camera.fov * Math.PI) / 180;
    const distancia = medioAnchoObjetivo / (Math.tan(fovRad / 2) * aspecto);
    camera.position.z = Math.max(distancia, distanciaMinima);
    camera.updateProjectionMatrix();
  }, [size, camera, medioAnchoObjetivo, distanciaMinima]);

  return null;
}

// "El plano cloud" del póster, como sección propia justo debajo del hero: ya no vive detrás del
// título (se superponía con el texto). Es un bloque normal del flujo, con su propio alto fijo
// para el lienzo 3D.
//
// Numeración: en el póster original este es el Bloque 02, pero en la página aparece primero
// (justo debajo del hero, por pedido explícito), así que se etiqueta "Bloque 01" para que la
// numeración visible en /landing siga el orden real en que se leen las secciones, no el orden
// del póster impreso. Si se reordenan las secciones en Landing.jsx, actualiza este número y el
// de los <Bloque numero="..."> correspondientes para que sigan siendo consecutivos.
export default function SeccionArquitectura() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ucp-granate">Bloque 01</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-800">El plano cloud</h2>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        nginx sirve el build de React y hace de proxy inverso para /api: es el único servicio con
        puerto publicado. backend y db solo se alcanzan por nombre de servicio dentro de la red
        interna de Docker.
      </p>

      <div className="relative mt-8 h-[28rem] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white sm:h-[32rem]">
        <Suspense fallback={<FallbackEstatico />}>
          <Lienzo3D camera={{ position: [0, 0.5, 9], fov: 45 }}>
            {(reduceMotion) => (
              <>
                <CamaraResponsiva />
                <EscenaArquitectura reduceMotion={reduceMotion} />
              </>
            )}
          </Lienzo3D>
        </Suspense>
      </div>
    </motion.section>
  );
}
