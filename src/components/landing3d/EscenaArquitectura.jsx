import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Line } from '@react-three/drei';
import { Globe, Cloud, Server } from 'lucide-react';
import { C } from './tokens.js';

// Recrea en 3D, fiel al póster académico, el Bloque 02 ("El plano cloud"): 3 contenedores ·
// 1 red interna · 2 volúmenes persistentes · 1 puerto público.
//   usuario --HTTPS 443→:80--> [Host Docker · docker-compose
//                                 [Red interna portal_net (borde punteado)
//                                    frontend (único con puerto publicado) --/api--> backend --SQL--> db ]
//                                 uploads_vol (/app/uploads, cuelga de frontend Y backend)
//                                 pg_data (PGDATA, cuelga de db) ]
// Con la misma leyenda del póster: línea sólida = tráfico HTTP(S), punteada = montaje de volumen,
// borde punteado = red interna Docker, y la nota Railway (pruebas) ⇒ servidor Linux UCP (destino).

const FUENTE_SANS = 'ui-sans-serif, system-ui';
const FUENTE_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Etiqueta tipo "píldora" (la usan las líneas de tráfico y la nota de Railway).
function Pildora({ icon: Icon, color, children, mono = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'white',
        border: `1px solid ${color}55`,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.10)',
        fontFamily: mono ? FUENTE_MONO : FUENTE_SANS,
        fontSize: 11,
        fontWeight: 600,
        color: C.ink,
        whiteSpace: 'nowrap',
      }}
    >
      {Icon && <Icon size={12} color={color} />}
      {children}
    </div>
  );
}

// Etiqueta en el punto medio de una línea de tráfico, levantada un poco para no tapar la línea.
function EtiquetaFlecha({ desde, hasta, texto, color, alto = 0.32 }) {
  const medio = [(desde[0] + hasta[0]) / 2, (desde[1] + hasta[1]) / 2 + alto, 0.2];
  return (
    <Html position={medio} center distanceFactor={8}>
      <Pildora color={color} mono>
        {texto}
      </Pildora>
    </Html>
  );
}

// frontend (React + Vite): núcleo con tres órbitas elípticas, el motivo del átomo de React.
// Las órbitas giran despacio sobre su eje (salvo con reduceMotion).
function FormaReact({ color, reduceMotion }) {
  const orbitasRef = useRef(null);
  useFrame((_, delta) => {
    if (reduceMotion || !orbitasRef.current) return;
    orbitasRef.current.rotation.z += delta * 0.25;
  });
  return (
    <group rotation={[0.2, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.16, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
      </mesh>
      <group ref={orbitasRef}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angulo) => (
          <group key={angulo} rotation={[0, 0, angulo]}>
            {/* Torus escalado en Y = elipse; las tres a 60° forman el átomo */}
            <mesh scale={[1, 0.36, 1]}>
              <torusGeometry args={[0.55, 0.035, 12, 48]} />
              <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// backend (Node.js): prisma hexagonal mirando a la cámara (evoca el hexágono de Node sin copiar
// el logo), con una cara frontal clara y un hexágono interior verde.
function FormaNode({ color }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.45, 6]} />
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} flatShading />
      </mesh>
      <mesh position={[0, 0.235, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 6]} />
        <meshStandardMaterial color={C.bg} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.255, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.03, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

// db (PostgreSQL): el tambor clásico de "base de datos": cilindro vertical inclinado hacia la
// cámara para que se vea la tapa elíptica, con dos bandas que marcan los "discos apilados".
function FormaPostgres({ color }) {
  return (
    <group rotation={[0.3, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 1.0, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.505, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 32]} />
        <meshStandardMaterial color={C.bg} roughness={0.9} transparent opacity={0.35} />
      </mesh>
      {[0.17, -0.17].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.485, 0.02, 8, 48]} />
          <meshStandardMaterial color={C.bg} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

const FORMAS = { react: FormaReact, node: FormaNode, postgres: FormaPostgres };

function Contenedor({ position, size, color, forma, label, detalle, publicado, reduceMotion }) {
  const Forma = FORMAS[forma];
  const pieza = (
    <group position={position}>
      <Forma color={color} reduceMotion={reduceMotion} />

      {/* Zócalo común: las tres formas distintas siguen leyéndose como "contenedores" del mismo
          compose, apoyados sobre la misma base. */}
      <mesh position={[0, -size[1] / 2 - 0.05, 0]}>
        <boxGeometry args={[1.05, 0.05, 0.7]} />
        <meshStandardMaterial color={C.slateLight} roughness={0.9} />
      </mesh>

      {/* Puerto publicado: solo frontend lo tiene. Un "enchufe" dorado que sobresale hacia el
          usuario, atravesando el borde de portal_net — es la única puerta de entrada. */}
      {publicado && (
        <group position={[-size[0] / 2 - 0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.32, 24]} />
            <meshStandardMaterial color={C.dorado} roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
            <meshStandardMaterial color={C.ink} roughness={0.6} />
          </mesh>
        </group>
      )}

      <Html position={[0, -size[1] / 2 - 0.62, 0]} center distanceFactor={8}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.slateLight }}>
            CONTENEDOR
          </div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 12, fontWeight: 700, color: C.ink }}>{label}</div>
          <div style={{ fontFamily: FUENTE_SANS, fontSize: 10, color: C.slate }}>{detalle}</div>
          {publicado && (
            <div
              style={{
                marginTop: 3,
                display: 'inline-block',
                padding: '1px 6px',
                borderRadius: 999,
                background: `${C.dorado}22`,
                border: `1px solid ${C.dorado}`,
                fontFamily: FUENTE_MONO,
                fontSize: 9,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              puerto 80 publicado
            </div>
          )}
        </div>
      </Html>
    </group>
  );

  if (reduceMotion) return pieza;
  return (
    <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.25}>
      {pieza}
    </Float>
  );
}

function Volumen({ position, label, montaje, contenido, reduceMotion }) {
  const pieza = (
    <group position={position}>
      {/* Pila de 3 platos (como los discos de un disco duro), inclinada hacia la cámara para que
          se vean las tapas y el espacio entre platos. */}
      <group rotation={[0.45, 0, 0]}>
        {[0.17, 0, -0.17].map((y) => (
          <group key={y} position={[0, y, 0]}>
            <mesh>
              <cylinderGeometry args={[0.45, 0.45, 0.1, 32]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.051, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
              <meshStandardMaterial color={C.slateLight} roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Eje central que une los platos */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.46, 12]} />
          <meshStandardMaterial color={C.slate} roughness={0.7} />
        </mesh>
      </group>
      <Html position={[0, -0.85, 0]} center distanceFactor={8}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.slateLight }}>
            VOLUMEN
          </div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 11, fontWeight: 700, color: C.ink }}>{label}</div>
          <div style={{ fontFamily: FUENTE_SANS, fontSize: 10, color: C.slate }}>{contenido}</div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 9, color: C.slateLight }}>montado en {montaje}</div>
        </div>
      </Html>
    </group>
  );

  if (reduceMotion) return pieza;
  return (
    <Float speed={1} rotationIntensity={0.04} floatIntensity={0.2}>
      {pieza}
    </Float>
  );
}

// Rectángulo cerrado como lista de puntos para <Line> (repite el primero para cerrar).
function rectangulo(x0, y0, x1, y1, z) {
  return [
    [x0, y0, z],
    [x1, y0, z],
    [x1, y1, z],
    [x0, y1, z],
    [x0, y0, z],
  ];
}

// Límites del póster: la caja grande "Host Docker · docker-compose" (plano translúcido + borde
// sólido) y, dentro, el borde punteado de la red interna portal_net que encierra solo a los 3
// contenedores (los volúmenes quedan fuera de la red, dentro del host).
const HOST = { x0: -4.1, y0: -3.1, x1: 5.6, y1: 2.8 };
const RED = { x0: -3.4, y0: -0.95, x1: 4.9, y1: 2.1 };

function Limites() {
  const ancho = HOST.x1 - HOST.x0;
  const alto = HOST.y1 - HOST.y0;
  return (
    <group>
      <mesh position={[(HOST.x0 + HOST.x1) / 2, (HOST.y0 + HOST.y1) / 2, -0.8]}>
        <planeGeometry args={[ancho, alto]} />
        <meshStandardMaterial color={C.slateLight} transparent opacity={0.1} roughness={1} />
      </mesh>
      <Line points={rectangulo(HOST.x0, HOST.y0, HOST.x1, HOST.y1, -0.8)} color={C.slate} lineWidth={1.5} />
      <Html position={[HOST.x0 + 0.15, HOST.y1 - 0.1, -0.8]} distanceFactor={8}>
        <div style={{ whiteSpace: 'nowrap', fontFamily: FUENTE_MONO, fontSize: 11, fontWeight: 700, color: C.slate }}>
          HOST DOCKER <span style={{ fontWeight: 400, color: C.slateLight }}>· docker-compose</span>
        </div>
      </Html>

      <Line
        points={rectangulo(RED.x0, RED.y0, RED.x1, RED.y1, -0.4)}
        color={C.verde}
        lineWidth={1.5}
        dashed
        dashSize={0.15}
        gapSize={0.12}
      />
      <Html position={[RED.x0 + 0.15, RED.y1 - 0.08, -0.4]} distanceFactor={8}>
        <div style={{ whiteSpace: 'nowrap', fontFamily: FUENTE_MONO, fontSize: 10, color: C.verde }}>
          <b>Red interna portal_net</b> <span style={{ color: C.slate }}>· sin puertos publicados</span>
        </div>
      </Html>
    </group>
  );
}

// Un "paquete" que recorre en loop una línea de tráfico. Con reduceMotion no se monta.
function Paquete({ desde, hasta, color, velocidad, desfase }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * velocidad + desfase) % 1;
    ref.current.position.set(
      desde[0] + (hasta[0] - desde[0]) * t,
      desde[1] + (hasta[1] - desde[1]) * t,
      desde[2] + (hasta[2] - desde[2]) * t + 0.6
    );
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
}

function Leyenda() {
  const fila = { display: 'flex', alignItems: 'center', gap: 6 };
  const muestra = (estilo) => <span style={{ display: 'inline-block', width: 22, ...estilo }} />;
  return (
    <div
      style={{
        padding: '6px 9px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.92)',
        border: `1px solid ${C.slateLight}55`,
        fontFamily: FUENTE_SANS,
        fontSize: 10,
        color: C.slate,
        whiteSpace: 'nowrap',
        display: 'grid',
        gap: 3,
      }}
    >
      <div style={{ fontFamily: FUENTE_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.slateLight }}>LEYENDA</div>
      <div style={fila}>{muestra({ borderTop: `2px solid ${C.granate}` })}Tráfico HTTP(S)</div>
      <div style={fila}>{muestra({ borderTop: `2px dashed ${C.slateLight}` })}Montaje de volumen</div>
      <div style={fila}>{muestra({ height: 9, border: `1.5px dashed ${C.verde}`, borderRadius: 2 })}Red interna Docker</div>
      <div style={fila}>
        {muestra({ height: 9, width: 9, marginInline: 6.5, borderRadius: 999, background: C.dorado })}Puerto publicado
      </div>
    </div>
  );
}

const PUNTOS = {
  usuario: [-5.9, 1.0, 0],
  frontend: [-2.3, 1.0, 0],
  backend: [0.8, 1.0, 0],
  db: [3.8, 1.0, 0],
  uploads: [-0.75, -2.05, 0],
  pgdata: [3.8, -2.05, 0],
};

export default function EscenaArquitectura({ reduceMotion = false }) {
  const grupoRef = useRef(null);
  const objetivo = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!grupoRef.current) return;
    if (!reduceMotion) {
      objetivo.current.x = state.pointer.x;
      objetivo.current.y = state.pointer.y;
    }
    grupoRef.current.rotation.y += (objetivo.current.x * 0.18 - grupoRef.current.rotation.y) * 0.04;
    grupoRef.current.rotation.x += (-objetivo.current.y * 0.08 - grupoRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={grupoRef}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={0.8} />

      {/* Subtítulo del bloque, igual que el póster */}
      <Html position={[-6.9, 3.6, 0]} distanceFactor={8}>
        <div style={{ whiteSpace: 'nowrap', fontFamily: FUENTE_MONO, fontSize: 11, color: C.slate }}>
          3 contenedores · 1 red interna · 2 volúmenes persistentes · 1 puerto público
        </div>
      </Html>

      {/* Nota de despliegue: el mismo plano en ambos entornos */}
      <Html position={[6.3, 3.6, 0]} distanceFactor={8}>
        <div style={{ transform: 'translateX(-100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Pildora icon={Cloud} color={C.rojo}>Railway (pruebas)</Pildora>
          <span style={{ fontFamily: FUENTE_SANS, fontWeight: 700, color: C.slate }}>⇒</span>
          <Pildora icon={Server} color={C.verde}>Servidor Linux UCP (destino)</Pildora>
        </div>
      </Html>

      <Limites />

      {/* Tráfico HTTP(S): usuario -> frontend (único puerto publicado), /api y SQL dentro de portal_net */}
      <Line points={[PUNTOS.usuario, PUNTOS.frontend]} color={C.granate} lineWidth={2.5} />
      <Line points={[PUNTOS.frontend, PUNTOS.backend]} color={C.verde} lineWidth={2} />
      <Line points={[PUNTOS.backend, PUNTOS.db]} color={C.dorado} lineWidth={2} />
      <EtiquetaFlecha desde={PUNTOS.usuario} hasta={[-2.9, 1.0, 0]} texto="HTTPS 443 → :80" color={C.granate} alto={0.38} />
      <EtiquetaFlecha desde={PUNTOS.frontend} hasta={PUNTOS.backend} texto="/api" color={C.verde} />
      <EtiquetaFlecha desde={PUNTOS.backend} hasta={PUNTOS.db} texto="SQL" color={C.dorado} />

      {!reduceMotion && (
        <>
          <Paquete desde={PUNTOS.usuario} hasta={PUNTOS.frontend} color={C.granate} velocidad={0.45} desfase={0} />
          <Paquete desde={PUNTOS.frontend} hasta={PUNTOS.backend} color={C.verde} velocidad={0.45} desfase={0.33} />
          <Paquete desde={PUNTOS.backend} hasta={PUNTOS.db} color={C.dorado} velocidad={0.45} desfase={0.66} />
        </>
      )}

      {/* Montaje de volumen: líneas punteadas, igual que la leyenda del póster.
          uploads_vol cuelga de frontend Y backend; pg_data solo de db. */}
      <Line points={[PUNTOS.frontend, PUNTOS.uploads]} color={C.slateLight} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.1} />
      <Line points={[PUNTOS.backend, PUNTOS.uploads]} color={C.slateLight} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.1} />
      <Line points={[PUNTOS.db, PUNTOS.pgdata]} color={C.slateLight} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.1} />

      {/* Usuario: fuera del host, solo entra por el puerto publicado */}
      <group position={PUNTOS.usuario}>
        <mesh>
          <boxGeometry args={[0.9, 0.62, 0.08]} />
          <meshStandardMaterial color={C.ink} roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.2]} />
          <meshStandardMaterial color={C.slate} roughness={0.85} />
        </mesh>
        <Html position={[0, -0.85, 0]} center distanceFactor={8}>
          <Pildora icon={Globe} color={C.granate}>Usuario · navegador web</Pildora>
        </Html>
      </group>

      <Contenedor
        position={PUNTOS.frontend}
        size={[1.1, 1.1, 1.1]}
        color={C.granate}
        forma="react"
        label="frontend"
        detalle="nginx · React + Vite"
        publicado
        reduceMotion={reduceMotion}
      />
      <Contenedor
        position={PUNTOS.backend}
        size={[1.1, 1.1, 1.1]}
        color={C.verde}
        forma="node"
        label="backend"
        detalle="Node.js · Express (ESM) · :4000 · stateless"
        reduceMotion={reduceMotion}
      />
      <Contenedor
        position={PUNTOS.db}
        size={[1, 1.2, 1]}
        color={C.dorado}
        forma="postgres"
        label="db"
        detalle="PostgreSQL · :5432 · interno"
        reduceMotion={reduceMotion}
      />

      <Volumen position={PUNTOS.uploads} label="uploads_vol" contenido="PDF y portadas" montaje="/app/uploads" reduceMotion={reduceMotion} />
      <Volumen position={PUNTOS.pgdata} label="pg_data" contenido="datos de Postgres" montaje="PGDATA" reduceMotion={reduceMotion} />

      <Html position={[-6.9, -2.2, 0]} distanceFactor={8}>
        <Leyenda />
      </Html>
    </group>
  );
}
