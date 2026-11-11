import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C } from './tokens.js';

// Fondo ambiental del hero: un anillo luminoso (el "portal") por el que van entrando tarjetas
// delgadas (los proyectos de los estudiantes) desde todos los bordes, rodeado de una red de
// puntos conectados (la comunidad), estrellas y "+" que suben (los votos), portales menores y
// acentos geométricos en las esquinas.
//
// Va DETRÁS de la tarjeta de título con backdrop-blur: lo único que realmente se ve son las
// esquinas y los bordes, así que la densidad visual se concentra ahí a propósito. El centro se
// deja limpio: las tarjetas se desvanecen antes de cruzar el portal.
//
// Todo usa meshBasicMaterial (sin luces): el canvas es transparente sobre fondo claro (C.bg), y
// los colores planos de la paleta UCP se leen mejor así que con sombreado. Tampoco se usa
// blending aditivo: sobre fondo claro lo aditivo se vuelve invisible.

const { smoothstep } = THREE.MathUtils;

// Generador pseudoaleatorio con semilla: la escena sale idéntica en cada render/recarga
// (con Math.random cambiaría en cada montaje y en modo estático se vería "saltar").
function crearAleatorio(semilla) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Textura circular difusa para los puntos: PointsMaterial dibuja cuadrados si no se le da un map.
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

// Estrella de 5 puntas como Shape plano: el "voto" de la comunidad.
function crearEstrella(radioExt, radioInt) {
  const forma = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radioExt : radioInt;
    const a = Math.PI / 2 + (i / 10) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) forma.moveTo(x, y);
    else forma.lineTo(x, y);
  }
  forma.closePath();
  return new THREE.ShapeGeometry(forma);
}

// Signo "+" (un "+1" sin texto) como Shape plano.
function crearMas(tam, grosor) {
  const a = tam / 2;
  const g = grosor / 2;
  const forma = new THREE.Shape();
  forma.moveTo(-g, a);
  forma.lineTo(g, a);
  forma.lineTo(g, g);
  forma.lineTo(a, g);
  forma.lineTo(a, -g);
  forma.lineTo(g, -g);
  forma.lineTo(g, -a);
  forma.lineTo(-g, -a);
  forma.lineTo(-g, -g);
  forma.lineTo(-a, -g);
  forma.lineTo(-a, g);
  forma.lineTo(-g, g);
  forma.closePath();
  return new THREE.ShapeGeometry(forma);
}

// Geometrías compartidas a nivel de módulo: decenas de mallas reutilizan las mismas en GPU en
// vez de crear una copia por tarjeta.
const GEO = {
  cuerpo: new THREE.PlaneGeometry(0.62, 0.42),
  borde: new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.62, 0.42)),
  franja: new THREE.PlaneGeometry(0.62, 0.08),
  linea1: new THREE.PlaneGeometry(0.42, 0.035),
  linea2: new THREE.PlaneGeometry(0.3, 0.035),
  estrella: crearEstrella(0.09, 0.04),
  estrellaGrande: crearEstrella(0.13, 0.055),
  mas: crearMas(0.2, 0.06),
  triangulo: new THREE.CircleGeometry(0.16, 3),
  rombo: new THREE.CircleGeometry(0.15, 4),
  trianguloHueco: new THREE.RingGeometry(0.15, 0.19, 3),
  romboHueco: new THREE.RingGeometry(0.14, 0.18, 4),
};

const PALETA = [C.granate, C.verde, C.dorado, C.rojo];

// Centro del portal: un poco hacia atrás para que el anillo enmarque la tarjeta de texto.
const CENTRO_PORTAL = new THREE.Vector3(0, 0, -1.2);

// Zona "visible": fuera del rectángulo central que tapa la tarjeta de texto.
function enBorde(x, y) {
  return Math.abs(x) > 3.7 || Math.abs(y) > 2.3;
}

// Trayectorias de los proyectos: llegan desde todos los bordes (estudiantes de distintos
// programas) y convergen en el centro del portal antes de perderse al fondo.
const TRAYECTORIAS = [
  [[-7, -3.6, 2], [-4.6, -2.4, 1.2], [-2.2, -0.9, 0.1]],
  [[7.2, -3.2, 1.5], [4.8, -2.0, 0.8], [2.2, -0.7, 0]],
  [[-6.8, 3.6, 1], [-4.4, 2.5, 0.5], [-2.0, 1.0, -0.3]],
  [[7, 3.4, 1.2], [4.6, 2.4, 0.6], [2.1, 1.0, -0.2]],
  [[-8, 0.3, 1.5], [-5.4, -0.4, 0.9], [-2.6, 0.1, 0]],
  [[8, -0.2, 1.5], [5.5, 0.5, 0.9], [2.7, 0.0, 0]],
  [[0.8, -4.6, 2], [1.6, -2.9, 1], [0.9, -1.3, 0]],
].map(
  (puntos, i) =>
    new THREE.CatmullRomCurve3(
      [...puntos, CENTRO_PORTAL.toArray(), [i % 2 ? -0.3 : 0.3, 0.1, -5]].map((p) => new THREE.Vector3(...p))
    )
);

// 3 tarjetas por trayectoria (21), con tamaño, giro y velocidad variados para que no se lea como
// una cinta transportadora uniforme. Una de cada dos lleva una estrella de "voto".
const TARJETAS = (() => {
  const aleatorio = crearAleatorio(4242);
  return TRAYECTORIAS.flatMap((curva, i) =>
    [0, 1, 2].map((j) => ({
      curva,
      desfase: (j / 3 + i * 0.137) % 1,
      color: PALETA[(i * 3 + j) % PALETA.length],
      velocidad: 0.02 + aleatorio() * 0.016,
      escala: 0.75 + aleatorio() * 0.55,
      giro: (aleatorio() - 0.5) * 0.9,
      conVoto: (i + j) % 2 === 0,
    }))
  );
})();

// Una tarjeta-proyecto: cuerpo translúcido del color del programa con borde nítido, franja
// superior sólida, dos "líneas de texto" abstractas y, a veces, una estrella de voto que late.
function TarjetaProyecto({ curva, desfase, color, velocidad, escala, giro, conVoto, reduceMotion }) {
  const grupoRef = useRef(null);
  const estrellaRef = useRef(null);
  const materiales = useRef([]);
  const tangente = useMemo(() => new THREE.Vector3(), []);

  // Opacidad máxima de cada pieza (mismo orden en que se registran los materiales abajo).
  const OPACIDAD_BASE = [0.3, 0.75, 0.95, 0.6, 0.45, 0.95];

  const ubicar = (t, tiempo) => {
    const grupo = grupoRef.current;
    if (!grupo) return;
    curva.getPointAt(t, grupo.position);
    curva.getTangentAt(t, tangente);

    // Entra suave desde fuera de pantalla y desaparece antes de llegar al centro del portal.
    const visibilidad = smoothstep(t, 0, 0.1) * (1 - smoothstep(t, 0.5, 0.75));
    materiales.current.forEach((m, i) => {
      if (m) m.opacity = OPACIDAD_BASE[i] * visibilidad;
    });

    grupo.scale.setScalar(escala * (1 - t * 0.45));
    grupo.rotation.set(
      0.15 + giro * 0.3,
      tangente.x * 0.5 + giro,
      Math.sin(t * Math.PI * 2 + desfase * 6) * 0.22 + giro * 0.4
    );

    if (estrellaRef.current) {
      estrellaRef.current.scale.setScalar(1 + Math.sin(tiempo * 3 + desfase * 10) * 0.18);
      estrellaRef.current.rotation.z = tiempo * 0.8 + desfase;
    }
  };

  // Posición inicial (y única, en modo estático): repartidas en la parte visible de la curva.
  useLayoutEffect(() => {
    ubicar(0.12 + (desfase % 1) * 0.33, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  useFrame((state) => {
    if (reduceMotion) return;
    const tiempo = state.clock.elapsedTime;
    ubicar((tiempo * velocidad + desfase) % 1, tiempo);
  });

  const registrar = (i) => (m) => {
    materiales.current[i] = m;
  };
  const comun = { transparent: true, depthWrite: false, side: THREE.DoubleSide };

  return (
    <group ref={grupoRef}>
      <mesh geometry={GEO.cuerpo}>
        <meshBasicMaterial ref={registrar(0)} color={color} {...comun} />
      </mesh>
      <lineSegments geometry={GEO.borde}>
        <lineBasicMaterial ref={registrar(1)} color={color} transparent depthWrite={false} />
      </lineSegments>
      <mesh geometry={GEO.franja} position={[0, 0.17, 0.001]}>
        <meshBasicMaterial ref={registrar(2)} color={color} {...comun} />
      </mesh>
      <mesh geometry={GEO.linea1} position={[-0.06, 0.02, 0.001]}>
        <meshBasicMaterial ref={registrar(3)} color={C.slate} {...comun} />
      </mesh>
      <mesh geometry={GEO.linea2} position={[-0.12, -0.07, 0.001]}>
        <meshBasicMaterial ref={registrar(4)} color={C.slateLight} {...comun} />
      </mesh>
      {conVoto && (
        <mesh ref={estrellaRef} geometry={GEO.estrella} position={[0.3, 0.22, 0.004]}>
          <meshBasicMaterial ref={registrar(5)} color={C.dorado} {...comun} />
        </mesh>
      )}
    </group>
  );
}

// La comunidad: una red de puntos (un único THREE.Points) con líneas tenues entre vecinos
// cercanos (un único LineSegments). Dos draw calls en total, con hueco central.
function Constelacion({ textura, reduceMotion }) {
  const grupoRef = useRef(null);

  const { puntos, lineas } = useMemo(() => {
    const aleatorio = crearAleatorio(20261111);
    const total = 420;
    const posiciones = new Float32Array(total * 3);
    const colores = new Float32Array(total * 3);
    // Mayoría gris, con acentos institucionales frecuentes.
    const paleta = [C.slateLight, C.slateLight, C.slate, C.dorado, C.granate, C.verde, C.rojo].map(
      (c) => new THREE.Color(c)
    );

    for (let i = 0; i < total; i++) {
      const angulo = aleatorio() * Math.PI * 2;
      const radio = 3.4 + Math.pow(aleatorio(), 0.8) * 5;
      posiciones[i * 3] = Math.cos(angulo) * radio * 1.35;
      posiciones[i * 3 + 1] = Math.sin(angulo) * radio * 0.8;
      posiciones[i * 3 + 2] = -4 + aleatorio() * 5.5;
      const color = paleta[Math.floor(aleatorio() * paleta.length)];
      colores.set([color.r, color.g, color.b], i * 3);
    }

    // Conexiones "de comunidad": cada punto se une a vecinos a menos de cierta distancia, con
    // tope de segmentos para que la red no se vuelva una maraña. Se calcula una sola vez.
    const segmentos = [];
    const UMBRAL2 = 1.15 * 1.15;
    for (let i = 0; i < total && segmentos.length < 900 * 3; i++) {
      let vecinos = 0;
      for (let j = i + 1; j < total && vecinos < 3; j++) {
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
    grupoRef.current.rotation.z += delta * 0.012;
  });

  return (
    <group ref={grupoRef}>
      <lineSegments geometry={lineas}>
        <lineBasicMaterial color={C.slateLight} transparent opacity={0.28} depthWrite={false} />
      </lineSegments>
      <points geometry={puntos}>
        <pointsMaterial map={textura} size={0.12} sizeAttenuation vertexColors transparent opacity={0.9} depthWrite={false} />
      </points>
    </group>
  );
}

// Anillo de puntos (para el aro interior y el exterior del portal principal).
function crearAnilloPuntos(total, radio) {
  const posiciones = new Float32Array(total * 3);
  for (let i = 0; i < total; i++) {
    const a = (i / total) * Math.PI * 2;
    posiciones[i * 3] = Math.cos(a) * radio;
    posiciones[i * 3 + 1] = Math.sin(a) * radio;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  return g;
}

// El portal principal: anillo granate, halo verde tenue, aros finos, arcos que giran (dorado y
// verde) para dar la sensación de algo "encendido", y dos anillos de puntos contrarrotando.
function Portal({ textura, reduceMotion }) {
  const arcosRef = useRef(null);
  const arcosExtRef = useRef(null);
  const puntosRef = useRef(null);
  const puntosExtRef = useRef(null);

  const anilloInterior = useMemo(() => crearAnilloPuntos(72, 2.72), []);
  const anilloExterior = useMemo(() => crearAnilloPuntos(120, 4.1), []);

  useFrame((_, delta) => {
    if (reduceMotion) return;
    if (arcosRef.current) arcosRef.current.rotation.z += delta * 0.18;
    if (arcosExtRef.current) arcosExtRef.current.rotation.z -= delta * 0.07;
    if (puntosRef.current) puntosRef.current.rotation.z -= delta * 0.05;
    if (puntosExtRef.current) puntosExtRef.current.rotation.z += delta * 0.03;
  });

  return (
    <group position={CENTRO_PORTAL} rotation={[0.18, -0.38, 0]}>
      <mesh>
        <ringGeometry args={[2.5, 3.3, 96]} />
        <meshBasicMaterial color={C.verde} transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <mesh>
        <torusGeometry args={[3, 0.035, 12, 200]} />
        <meshBasicMaterial color={C.granate} />
      </mesh>

      <mesh>
        <torusGeometry args={[3.38, 0.009, 8, 200]} />
        <meshBasicMaterial color={C.slateLight} transparent opacity={0.75} />
      </mesh>

      <group ref={arcosRef} rotation={[0, 0, 0.6]}>
        <mesh>
          <torusGeometry args={[3, 0.065, 12, 80, Math.PI * 0.42]} />
          <meshBasicMaterial color={C.dorado} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[3, 0.05, 12, 60, Math.PI * 0.24]} />
          <meshBasicMaterial color={C.verde} />
        </mesh>
      </group>

      {/* Aro exterior en arcos: se asoma por las esquinas alrededor de la tarjeta de texto */}
      <group ref={arcosExtRef}>
        <mesh>
          <torusGeometry args={[3.75, 0.018, 8, 90, Math.PI * 0.55]} />
          <meshBasicMaterial color={C.rojo} transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI * 1.1]}>
          <torusGeometry args={[3.75, 0.018, 8, 90, Math.PI * 0.35]} />
          <meshBasicMaterial color={C.granate} transparent opacity={0.6} />
        </mesh>
      </group>

      <points ref={puntosRef} geometry={anilloInterior}>
        <pointsMaterial map={textura} color={C.granate} size={0.08} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
      </points>
      <points ref={puntosExtRef} geometry={anilloExterior}>
        <pointsMaterial map={textura} color={C.dorado} size={0.09} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
      </points>
    </group>
  );
}

// Portales menores en las esquinas: eco del principal (otros "puntos de entrada"), para que los
// bordes visibles tengan presencia.
const PORTALES_MENORES = [
  { posicion: [5.0, 2.45, -1.5], radio: 0.85, color: C.dorado, arco: C.granate, velocidad: 0.35, rotacion: [0.2, 0.5, 0] },
  { posicion: [-5.2, -2.4, -1], radio: 1.0, color: C.verde, arco: C.dorado, velocidad: -0.28, rotacion: [-0.2, -0.45, 0] },
  { posicion: [-5.6, 2.75, -2], radio: 0.5, color: C.granate, arco: C.verde, velocidad: 0.5, rotacion: [0.3, -0.3, 0] },
  { posicion: [5.7, -2.7, -1.8], radio: 0.45, color: C.rojo, arco: C.dorado, velocidad: -0.45, rotacion: [-0.25, 0.4, 0] },
];

function PortalMenor({ posicion, radio, color, arco, velocidad, rotacion, reduceMotion }) {
  const arcoRef = useRef(null);

  useFrame((_, delta) => {
    if (reduceMotion || !arcoRef.current) return;
    arcoRef.current.rotation.z += delta * velocidad;
  });

  return (
    <group position={posicion} rotation={rotacion}>
      <mesh>
        <circleGeometry args={[radio, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <torusGeometry args={[radio, 0.02, 8, 96]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <torusGeometry args={[radio * 1.22, 0.006, 6, 96]} />
        <meshBasicMaterial color={C.slateLight} transparent opacity={0.7} />
      </mesh>
      <mesh ref={arcoRef}>
        <torusGeometry args={[radio, 0.045, 8, 40, Math.PI * 0.5]} />
        <meshBasicMaterial color={arco} />
      </mesh>
    </group>
  );
}

// Acentos geométricos (triángulos y rombos, llenos y huecos) flotando en los bordes. Un solo
// useFrame anima todos.
const ACENTOS = (() => {
  const aleatorio = crearAleatorio(777);
  const formas = ['triangulo', 'rombo', 'trianguloHueco', 'romboHueco'];
  const lista = [];
  while (lista.length < 20) {
    const x = (aleatorio() - 0.5) * 12.4;
    const y = (aleatorio() - 0.5) * 6.8;
    if (!enBorde(x, y)) continue;
    const forma = formas[lista.length % formas.length];
    lista.push({
      posicion: [x, y, -1.5 + aleatorio() * 2],
      forma,
      color: PALETA[Math.floor(aleatorio() * PALETA.length)],
      escala: 0.6 + aleatorio() * 0.9,
      opacidad: forma.endsWith('Hueco') ? 0.85 : 0.5,
      fase: aleatorio() * Math.PI * 2,
      giro: (aleatorio() - 0.5) * 0.8,
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
      malla.position.y = a.posicion[1] + Math.sin(t * 0.6 + a.fase) * 0.12;
      malla.rotation.z = a.fase + t * a.giro;
    });
  });

  return (
    <group ref={grupoRef}>
      {ACENTOS.map((a, i) => (
        <mesh key={i} geometry={GEO[a.forma]} position={a.posicion} rotation={[0, 0, a.fase]} scale={a.escala}>
          <meshBasicMaterial color={a.color} transparent opacity={a.opacidad} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Votos de la comunidad: estrellas y "+" que suben despacio por los costados y se desvanecen
// arriba, en loop. En modo estático quedan quietas a media altura.
const VOTOS = (() => {
  const aleatorio = crearAleatorio(31337);
  return Array.from({ length: 18 }, (_, i) => {
    const lado = i % 2 === 0 ? -1 : 1;
    return {
      x: lado * (3.9 + aleatorio() * 2.2),
      z: -0.8 + aleatorio() * 1.6,
      fase: aleatorio(),
      velocidad: 0.04 + aleatorio() * 0.04,
      forma: i % 3 === 0 ? 'mas' : i % 3 === 1 ? 'estrellaGrande' : 'estrella',
      color: i % 3 === 0 ? C.verde : i % 4 === 0 ? C.rojo : C.dorado,
    };
  });
})();

function Votos({ reduceMotion }) {
  const grupoRef = useRef(null);

  const ubicar = (tiempo) => {
    if (!grupoRef.current) return;
    grupoRef.current.children.forEach((malla, i) => {
      const v = VOTOS[i];
      const ciclo = (tiempo * v.velocidad + v.fase) % 1;
      malla.position.set(v.x, -3.8 + ciclo * 7.6, v.z);
      malla.material.opacity = Math.sin(Math.PI * ciclo) * 0.9;
      malla.rotation.z = Math.sin(tiempo * 0.9 + v.fase * 8) * 0.35;
    });
  };

  useLayoutEffect(() => {
    ubicar(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  useFrame((state) => {
    if (reduceMotion) return;
    ubicar(state.clock.elapsedTime);
  });

  return (
    <group ref={grupoRef}>
      {VOTOS.map((v, i) => (
        <mesh key={i} geometry={GEO[v.forma]}>
          <meshBasicMaterial color={v.color} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default function EscenaPortal({ reduceMotion = false }) {
  const grupoRef = useRef(null);
  const objetivo = useRef({ x: 0, y: 0 });
  const textura = useMemo(() => crearTexturaPunto(), []);

  // Mismo parallax suave con el puntero que EscenaArquitectura; con reduceMotion la escena no
  // se mueve.
  useFrame((state) => {
    if (!grupoRef.current || reduceMotion) return;
    objetivo.current.x = state.pointer.x;
    objetivo.current.y = state.pointer.y;
    grupoRef.current.rotation.y += (objetivo.current.x * 0.12 - grupoRef.current.rotation.y) * 0.04;
    grupoRef.current.rotation.x += (-objetivo.current.y * 0.08 - grupoRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={grupoRef}>
      <Constelacion textura={textura} reduceMotion={reduceMotion} />
      <Portal textura={textura} reduceMotion={reduceMotion} />
      {PORTALES_MENORES.map((p, i) => (
        <PortalMenor key={i} {...p} reduceMotion={reduceMotion} />
      ))}
      <Acentos reduceMotion={reduceMotion} />
      <Votos reduceMotion={reduceMotion} />
      {TARJETAS.map((tarjeta, i) => (
        <TarjetaProyecto key={i} {...tarjeta} reduceMotion={reduceMotion} />
      ))}
    </group>
  );
}
