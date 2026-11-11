import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C } from './tokens.js';

// Fondo del hero de /proyectos/pub (issue #39). A diferencia del "portal" de /landing
// (EscenaPortal.jsx), esta escena no ilustra el flujo de datos del portal sino la idea de que la
// Facultad de Ciencias Básicas e Ingeniería de la UCP investiga y construye en varios frentes a
// la vez: un núcleo facetado (el conocimiento) rodeado de íconos 3D que representan disciplinas
// de los proyectos que se muestran debajo (mecánica/industrial, sistemas/electrónica, ciencias
// básicas, telecomunicaciones), flotando con su propio micro-movimiento en vez de orbitar en
// bloque — más "laboratorio en marcha" que "cinta transportadora".
//
// Mismo lenguaje visual que EscenaPortal: solo meshBasicMaterial (sin luces, el canvas es
// transparente sobre fondo claro), paleta plana UCP, sin blending aditivo, geometrías
// compartidas a nivel de módulo para que decenas de mallas no dupliquen buffers en GPU.

// Generador pseudoaleatorio con semilla (igual que en EscenaPortal): la escena sale idéntica en
// cada render/recarga, y en modo estático no "salta" de una posición a otra entre montajes.
function crearAleatorio(semilla) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Textura circular difusa para los puntos de la red de fondo (PointsMaterial dibuja cuadrados
// sin un map).
function crearTexturaPunto() {
  const lienzo = document.createElement('canvas');
  lienzo.width = 64;
  lienzo.height = 64;
  const ctx = lienzo.getContext('2d');
  const gradiente = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradiente.addColorStop(0, 'rgba(255,255,255,1)');
  gradiente.addColorStop(0.45, 'rgba(255,255,255,0.9)');
  gradiente.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, 64, 64);
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

// Silueta de engranaje: dientes de punta plana (4 vértices por diente: raíz-punta-punta-raíz)
// en vez de picos de estrella, para que se lea como un engranaje y no como un acento más. Con
// un agujero central para el "eje". Shape plano extruido a 0 (como crearEstrella/crearMas de
// EscenaPortal) — se lee bien igual porque todo en esta escena es meshBasicMaterial sin sombreado.
function crearEngranaje(radioInt, radioExt, dientes, radioEje) {
  const forma = new THREE.Shape();
  const pasoAngular = (Math.PI * 2) / dientes;
  const anchoPunta = pasoAngular * 0.42;
  const anchoRaiz = pasoAngular * 0.74;
  let primero = true;
  for (let i = 0; i < dientes; i++) {
    const centro = i * pasoAngular;
    const vertices = [
      [radioInt, centro - anchoRaiz / 2],
      [radioExt, centro - anchoPunta / 2],
      [radioExt, centro + anchoPunta / 2],
      [radioInt, centro + anchoRaiz / 2],
    ];
    vertices.forEach(([r, a]) => {
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (primero) {
        forma.moveTo(x, y);
        primero = false;
      } else forma.lineTo(x, y);
    });
  }
  forma.closePath();
  const eje = new THREE.Path();
  eje.absarc(0, 0, radioEje, 0, Math.PI * 2, true);
  forma.holes.push(eje);
  return new THREE.ShapeGeometry(forma, 1);
}

// Geometrías compartidas a nivel de módulo (una sola copia en GPU para todas las instancias).
const GEO = {
  // Engranajes (mecánica / ingeniería industrial).
  engranajeGrande: crearEngranaje(0.16, 0.26, 10, 0.08),
  engranajeChico: crearEngranaje(0.11, 0.19, 8, 0.055),
  // Circuito / chip (sistemas, electrónica).
  chip: new THREE.PlaneGeometry(0.46, 0.46),
  chipBorde: new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.46, 0.46)),
  traza: new THREE.PlaneGeometry(0.24, 0.028),
  pin: new THREE.PlaneGeometry(0.05, 0.05),
  // Molécula (ciencias básicas).
  atomoCentro: new THREE.IcosahedronGeometry(0.1, 0),
  atomoElectron: new THREE.IcosahedronGeometry(0.045, 0),
  enlace: new THREE.CylinderGeometry(0.012, 0.012, 1, 6),
  // Antena + ondas de señal (telecomunicaciones).
  mastilAntena: new THREE.ConeGeometry(0.03, 0.55, 8),
  baseAntena: new THREE.CylinderGeometry(0.1, 0.12, 0.05, 10),
  ondaAntena: new THREE.RingGeometry(0.9, 1, 40),
  // Núcleo central facetado (el conocimiento del que cuelga todo lo demás).
  nucleoWire: new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, 1)),
  nucleoInterior: new THREE.IcosahedronGeometry(0.76, 0),
  // Acentos sueltos (triángulos/rombos), igual idea que EscenaPortal para rellenar los bordes.
  triangulo: new THREE.CircleGeometry(0.14, 3),
  rombo: new THREE.CircleGeometry(0.13, 4),
};

const PALETA = [C.granate, C.verde, C.dorado, C.rojo];

// Zona "visible": fuera del rectángulo central que tapa la tarjeta de texto (mismo criterio que
// EscenaPortal, para que los íconos no queden detrás del título).
function enBorde(x, y) {
  return Math.abs(x) > 3.6 || Math.abs(y) > 2.1;
}

// ── Núcleo: un icosaedro en wireframe (la "idea" / investigación) con una cáscara interior
// translúcida, rotando despacio sobre dos ejes a la vez para que se lea como un objeto 3D real
// y no una imagen plana girando.
function Nucleo({ reduceMotion }) {
  const wireRef = useRef(null);
  const interiorRef = useRef(null);

  useFrame((_, delta) => {
    if (reduceMotion) return;
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.09;
      wireRef.current.rotation.x += delta * 0.035;
    }
    if (interiorRef.current) interiorRef.current.rotation.y -= delta * 0.05;
  });

  return (
    <group position={[0, 0, -1.6]}>
      <mesh ref={interiorRef} geometry={GEO.nucleoInterior}>
        <meshBasicMaterial color={C.verde} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments ref={wireRef} geometry={GEO.nucleoWire}>
        <lineBasicMaterial color={C.granate} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

// ── Par de engranajes: dos siluetas encajadas girando en sentidos opuestos. La pieza más
// reconocible como "ingeniería" del conjunto.
function ParEngranajes({ posicion, escala, colorA, colorB, velocidad, reduceMotion }) {
  const refA = useRef(null);
  const refB = useRef(null);

  useFrame((_, delta) => {
    if (reduceMotion) return;
    if (refA.current) refA.current.rotation.z += delta * velocidad;
    if (refB.current) refB.current.rotation.z -= delta * velocidad * 1.35;
  });

  const comun = { transparent: true, depthWrite: false, side: THREE.DoubleSide };
  return (
    <group position={posicion} scale={escala}>
      <mesh ref={refA} geometry={GEO.engranajeGrande} position={[-0.16, 0, 0]}>
        <meshBasicMaterial color={colorA} opacity={0.85} {...comun} />
      </mesh>
      <mesh ref={refB} geometry={GEO.engranajeChico} position={[0.21, 0.03, 0.01]}>
        <meshBasicMaterial color={colorB} opacity={0.85} {...comun} />
      </mesh>
    </group>
  );
}

// Trazas de un chip: segmentos cortos alrededor del cuerpo, posición fija por instancia (no
// animadas, son decoración de "circuito impreso").
const TRAZAS_CHIP = [
  { posicion: [0.3, 0.09, 0.004], rotacion: 0 },
  { posicion: [-0.29, -0.06, 0.004], rotacion: 0.12 },
  { posicion: [0.04, 0.29, 0.004], rotacion: Math.PI / 2 },
  { posicion: [-0.07, -0.29, 0.004], rotacion: Math.PI / 2 + 0.18 },
];

// ── Circuito / chip: una placa con borde, trazas y un pin que "parpadea" (actividad), como un
// chip trabajando — sistemas/electrónica.
function Circuito({ posicion, escala, color, fase, reduceMotion }) {
  const pinRef = useRef(null);

  useFrame((state) => {
    if (reduceMotion || !pinRef.current) return;
    pinRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2 + fase * 6) * 0.35;
  });

  return (
    <group position={posicion} scale={escala} rotation={[0.12, 0.4, 0]}>
      <mesh geometry={GEO.chip}>
        <meshBasicMaterial color={C.ink} transparent opacity={0.82} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={GEO.chipBorde}>
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
      {TRAZAS_CHIP.map((t, i) => (
        <mesh key={i} geometry={GEO.traza} position={t.posicion} rotation={[0, 0, t.rotacion]}>
          <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
      <mesh ref={pinRef} geometry={GEO.pin} position={[0.17, 0.17, 0.01]}>
        <meshBasicMaterial color={C.dorado} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

// Posiciones de los átomos externos de cada molécula (forma fija, sin simetría perfecta a
// propósito para que no se lea como un ícono genérico).
const ATOMOS_OFFSET = [
  [0.22, 0.15, 0.05],
  [-0.2, 0.17, -0.08],
  [0.05, -0.22, 0.12],
  [-0.12, -0.1, -0.18],
];

// ── Molécula: átomo central + 4 átomos satélite unidos por enlaces, toda la estructura
// "tumbando" despacio sobre dos ejes — ciencias básicas.
function Molecula({ posicion, escala, colorCentro, coloresElectron, velocidad, reduceMotion }) {
  const grupoRef = useRef(null);
  const enlaceRefs = useRef([]);

  // Los enlaces son cilindros (altura 1 en Y) estirados y orientados una sola vez hacia cada
  // átomo satélite: la forma de la molécula es fija, solo el grupo completo rota.
  useLayoutEffect(() => {
    ATOMOS_OFFSET.forEach((offset, i) => {
      const enlace = enlaceRefs.current[i];
      if (!enlace) return;
      const destino = new THREE.Vector3(...offset);
      const longitud = destino.length();
      enlace.scale.set(1, longitud, 1);
      enlace.position.copy(destino).multiplyScalar(0.5);
      enlace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), destino.clone().normalize());
    });
  }, []);

  useFrame((_, delta) => {
    if (reduceMotion || !grupoRef.current) return;
    grupoRef.current.rotation.y += delta * velocidad;
    grupoRef.current.rotation.x += delta * velocidad * 0.4;
  });

  return (
    <group ref={grupoRef} position={posicion} scale={escala}>
      <mesh geometry={GEO.atomoCentro}>
        <meshBasicMaterial color={colorCentro} />
      </mesh>
      {ATOMOS_OFFSET.map((offset, i) => (
        <mesh key={i} geometry={GEO.atomoElectron} position={offset}>
          <meshBasicMaterial color={coloresElectron[i % coloresElectron.length]} />
        </mesh>
      ))}
      {ATOMOS_OFFSET.map((_, i) => (
        <mesh key={i} ref={(el) => (enlaceRefs.current[i] = el)} geometry={GEO.enlace}>
          <meshBasicMaterial color={C.slateLight} transparent opacity={0.8} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

const ONDAS_ANTENA = 3;

// ── Antena: mástil + base, con anillos de "señal" que se expanden y se desvanecen en bucle —
// telecomunicaciones.
function Antena({ posicion, escala, color, colorOnda, fase, velocidad, reduceMotion }) {
  const ondaRefs = useRef([]);

  const ubicar = (t) => {
    for (let i = 0; i < ONDAS_ANTENA; i++) {
      const malla = ondaRefs.current[i];
      if (!malla) continue;
      const ciclo = (t * velocidad + fase + i / ONDAS_ANTENA) % 1;
      malla.scale.setScalar(0.08 + ciclo * 0.55);
      malla.material.opacity = (1 - ciclo) * 0.65;
    }
  };

  useLayoutEffect(() => {
    ubicar(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!reduceMotion) ubicar(state.clock.elapsedTime);
  });

  return (
    <group position={posicion} scale={escala}>
      <mesh geometry={GEO.baseAntena} position={[0, -0.28, 0]}>
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh geometry={GEO.mastilAntena} position={[0, 0.02, 0]}>
        <meshBasicMaterial color={color} />
      </mesh>
      {Array.from({ length: ONDAS_ANTENA }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (ondaRefs.current[i] = el)}
          geometry={GEO.ondaAntena}
          position={[0, 0.32, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color={colorOnda} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Posiciones fijas de cada pieza, repartidas en los bordes visibles (fuera de `enBorde`) y en
// distintas profundidades para dar paralaje. Nada se superpone al centro, donde va la tarjeta
// de texto con el título de la vitrina.
const ENGRANAJES = [
  { posicion: [-5.9, -2.6, -0.6], escala: 1, colorA: C.granate, colorB: C.dorado, velocidad: 0.55 },
  { posicion: [6.1, 2.2, -0.9], escala: 0.8, colorA: C.verde, colorB: C.granate, velocidad: -0.45 },
  { posicion: [-6.4, 2.75, -1.5], escala: 0.6, colorA: C.dorado, colorB: C.verde, velocidad: 0.7 },
];

const CIRCUITOS = [
  { posicion: [5.4, -2.9, -0.4], escala: 1, color: C.verde, fase: 0.1 },
  { posicion: [-4.3, 0.35, -1.9], escala: 0.75, color: C.granate, fase: 0.5 },
  { posicion: [7.1, 0.5, -1.2], escala: 0.6, color: C.dorado, fase: 0.8 },
];

const MOLECULAS = [
  { posicion: [-7.1, -0.5, -0.9], escala: 1.1, colorCentro: C.granate, coloresElectron: [C.verde, C.dorado, C.rojo, C.verde], velocidad: 0.3 },
  { posicion: [4.1, 3.1, -1.7], escala: 0.8, colorCentro: C.verde, coloresElectron: [C.dorado, C.granate, C.verde, C.dorado], velocidad: -0.22 },
];

const ANTENAS = [
  { posicion: [6.7, -0.35, -1.0], escala: 1, color: C.ink, colorOnda: C.verde, fase: 0, velocidad: 0.18 },
  { posicion: [-5.1, 3.0, -1.2], escala: 0.8, color: C.ink, colorOnda: C.dorado, fase: 0.45, velocidad: 0.22 },
];

// Acentos sueltos (triángulos/rombos) para que los bordes no se sientan vacíos entre las piezas
// grandes — mismo recurso que EscenaPortal.
const ACENTOS = (() => {
  const aleatorio = crearAleatorio(909090);
  const formas = ['triangulo', 'rombo'];
  const lista = [];
  while (lista.length < 14) {
    const x = (aleatorio() - 0.5) * 13;
    const y = (aleatorio() - 0.5) * 7;
    if (!enBorde(x, y)) continue;
    lista.push({
      posicion: [x, y, -1.2 + aleatorio() * 1.8],
      forma: formas[lista.length % formas.length],
      color: PALETA[Math.floor(aleatorio() * PALETA.length)],
      escala: 0.5 + aleatorio() * 0.7,
      fase: aleatorio() * Math.PI * 2,
      giro: (aleatorio() - 0.5) * 0.7,
    });
  }
  return lista;
})();

function Acentos({ reduceMotion }) {
  const grupoRef = useRef(null);

  useFrame((state) => {
    if (reduceMotion || !grupoRef.current) return;
    const t = state.clock.elapsedTime;
    grupoRef.current.children.forEach((malla, i) => {
      const a = ACENTOS[i];
      malla.position.y = a.posicion[1] + Math.sin(t * 0.55 + a.fase) * 0.11;
      malla.rotation.z = a.fase + t * a.giro;
    });
  });

  return (
    <group ref={grupoRef}>
      {ACENTOS.map((a, i) => (
        <mesh key={i} geometry={GEO[a.forma]} position={a.posicion} rotation={[0, 0, a.fase]} scale={a.escala}>
          <meshBasicMaterial color={a.color} transparent opacity={0.45} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Red de conocimiento: una nube de puntos con líneas tenues entre vecinos cercanos, girando muy
// despacio — mismo recurso que la Constelación de EscenaPortal (comunidad), aquí leída como
// "red de investigación/datos" detrás de todo lo demás.
function RedConocimiento({ textura, reduceMotion }) {
  const grupoRef = useRef(null);

  const { puntos, lineas } = useMemo(() => {
    const aleatorio = crearAleatorio(13021988);
    const total = 320;
    const posiciones = new Float32Array(total * 3);
    const colores = new Float32Array(total * 3);
    const paleta = [C.slateLight, C.slateLight, C.slate, C.dorado, C.granate, C.verde].map((c) => new THREE.Color(c));

    for (let i = 0; i < total; i++) {
      const angulo = aleatorio() * Math.PI * 2;
      const radio = 3.2 + Math.pow(aleatorio(), 0.8) * 5.2;
      posiciones[i * 3] = Math.cos(angulo) * radio * 1.35;
      posiciones[i * 3 + 1] = Math.sin(angulo) * radio * 0.8;
      posiciones[i * 3 + 2] = -4.5 + aleatorio() * 5.5;
      const color = paleta[Math.floor(aleatorio() * paleta.length)];
      colores.set([color.r, color.g, color.b], i * 3);
    }

    const segmentos = [];
    const UMBRAL2 = 1.05 * 1.05;
    for (let i = 0; i < total && segmentos.length < 700 * 3; i++) {
      let vecinos = 0;
      for (let j = i + 1; j < total && vecinos < 2; j++) {
        const dx = posiciones[i * 3] - posiciones[j * 3];
        const dy = posiciones[i * 3 + 1] - posiciones[j * 3 + 1];
        const dz = posiciones[i * 3 + 2] - posiciones[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < UMBRAL2) {
          segmentos.push(...posiciones.subarray(i * 3, i * 3 + 3), ...posiciones.subarray(j * 3, j * 3 + 3));
          vecinos++;
        }
      }
    }

    const gPuntos = new THREE.BufferGeometry();
    gPuntos.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    gPuntos.setAttribute('color', new THREE.BufferAttribute(colores, 3));

    const gLineas = new THREE.BufferGeometry();
    gLineas.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segmentos), 3));

    return { puntos: gPuntos, lineas: gLineas };
  }, []);

  useFrame((_, delta) => {
    if (reduceMotion || !grupoRef.current) return;
    grupoRef.current.rotation.z -= delta * 0.01;
  });

  return (
    <group ref={grupoRef}>
      <lineSegments geometry={lineas}>
        <lineBasicMaterial color={C.slateLight} transparent opacity={0.25} depthWrite={false} />
      </lineSegments>
      <points geometry={puntos}>
        <pointsMaterial map={textura} size={0.11} sizeAttenuation vertexColors transparent opacity={0.85} depthWrite={false} />
      </points>
    </group>
  );
}

export default function EscenaInnovacion({ reduceMotion = false }) {
  const grupoRef = useRef(null);
  const objetivo = useRef({ x: 0, y: 0 });
  const textura = useMemo(() => crearTexturaPunto(), []);

  // Mismo parallax suave con el puntero que EscenaPortal; con reduceMotion la escena queda fija.
  useFrame((state) => {
    if (!grupoRef.current || reduceMotion) return;
    objetivo.current.x = state.pointer.x;
    objetivo.current.y = state.pointer.y;
    grupoRef.current.rotation.y += (objetivo.current.x * 0.1 - grupoRef.current.rotation.y) * 0.04;
    grupoRef.current.rotation.x += (-objetivo.current.y * 0.07 - grupoRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={grupoRef}>
      <RedConocimiento textura={textura} reduceMotion={reduceMotion} />
      <Nucleo reduceMotion={reduceMotion} />
      <Acentos reduceMotion={reduceMotion} />
      {ENGRANAJES.map((p, i) => (
        <ParEngranajes key={i} {...p} reduceMotion={reduceMotion} />
      ))}
      {CIRCUITOS.map((p, i) => (
        <Circuito key={i} {...p} reduceMotion={reduceMotion} />
      ))}
      {MOLECULAS.map((p, i) => (
        <Molecula key={i} {...p} reduceMotion={reduceMotion} />
      ))}
      {ANTENAS.map((p, i) => (
        <Antena key={i} {...p} reduceMotion={reduceMotion} />
      ))}
    </group>
  );
}
