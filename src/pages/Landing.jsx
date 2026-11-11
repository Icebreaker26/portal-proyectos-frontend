import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Bell,
  Layers,
  ThumbsUp,
  GitBranch,
  Fingerprint,
  Globe,
  Server,
  HardDrive,
  Archive,
  ArrowRight,
  Cloud,
  Building2,
  CheckCircle2,
  RefreshCw,
  TestTube2,
  FileCheck2,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import Footer from '../components/Footer.jsx';
import FallbackEstatico from '../components/landing3d/FallbackEstatico.jsx';

// Ambas cargan aparte (chunk de three.js + @react-three/fiber): no deben bloquear el primer
// pintado de /landing ni descargarse en rutas que no la usan. `SeccionArquitectura` importa
// `Lienzo3D` (que a su vez importa `@react-three/fiber`), así que también debe ser `lazy` —
// un import estático aquí mete three.js en el bundle principal de TODA la app, no solo /landing.
const HeroEscena3D = lazy(() => import('../components/landing3d/HeroEscena3D.jsx'));
const SeccionArquitectura = lazy(() => import('../components/landing3d/SeccionArquitectura.jsx'));

const entrada = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

// Contenedor + ítem para listas/grids que entran de a una pieza (no todo el bloque de golpe):
// el hijo solo necesita `variants={item}` y hereda el estado "mostrar"/"oculto" del padre.
const lista = {
  oculto: {},
  mostrar: { transition: { staggerChildren: 0.07 } },
};
const item = {
  oculto: { opacity: 0, y: 10 },
  mostrar: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function Bloque({ numero, titulo, children }) {
  return (
    <motion.section {...entrada} className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ucp-granate">Bloque {numero}</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-800">{titulo}</h2>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

// Para secciones que no son "bloques" del póster (no llevan la numeración Bloque N): Resultados
// y Referencias, agregadas al final por pedido del docente.
function Seccion({ eyebrow, icon: Icon, titulo, children }) {
  return (
    <motion.section {...entrada} className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-ucp-granate" />}
        <p className="text-xs font-semibold uppercase tracking-wide text-ucp-granate">{eyebrow}</p>
      </div>
      <h2 className="mt-1 text-2xl font-semibold text-slate-800">{titulo}</h2>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function Referencia({ numero, titulo, fuente, href }) {
  return (
    <motion.li variants={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ucp-granate/10 text-xs font-semibold text-ucp-granate">
        {numero}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{titulo}</p>
        <p className="text-xs text-slate-500">{fuente}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-ucp-verde hover:underline"
        >
          {href.replace(/^https?:\/\//, '')}
          <ExternalLink size={11} />
        </a>
      </div>
    </motion.li>
  );
}

// Grid/fila/lista que anima sus hijos en cascada al entrar en vista. `as` elige la etiqueta
// (por defecto div; "ul" cuando los hijos son <motion.li>, para que siga siendo una lista real).
function Cascada({ as = 'div', className, children }) {
  const Etiqueta = motion[as];
  return (
    <Etiqueta variants={lista} initial="oculto" whileInView="mostrar" viewport={{ once: true, margin: '-60px' }} className={className}>
      {children}
    </Etiqueta>
  );
}

function Chip({ icon: Icon, children }) {
  return (
    <motion.span
      variants={item}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
    >
      {Icon && <Icon size={13} className="text-slate-400" />}
      {children}
    </motion.span>
  );
}

function Tarjeta({ icon: Icon, iconClassName, titulo, children }) {
  return (
    <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-4">
      {Icon && (
        <div className={`mb-2 inline-flex rounded-lg p-1.5 ${iconClassName ?? 'bg-slate-100 text-slate-500'}`}>
          <Icon size={16} />
        </div>
      )}
      <p className="text-sm font-semibold text-slate-800">{titulo}</p>
      <p className="mt-1 text-xs text-slate-500">{children}</p>
    </motion.div>
  );
}

function PuntoLista({ icon: Icon, children }) {
  return (
    <motion.li variants={item} className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-ucp-verde" />
      <span>{children}</span>
    </motion.li>
  );
}

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F7F8FA]">
      <div className="flex h-1" aria-hidden="true">
        <div className="flex-1 bg-ucp-granate" />
        <div className="flex-1 bg-ucp-verde" />
        <div className="flex-1 bg-ucp-dorado" />
      </div>

      {/* Hero: fondo 3D puramente estético (un "portal" por el que flotan proyectos), título y
          CTAs superpuestos en HTML normal (nunca texto 3D) para que sigan siendo accesibles. */}
      <div className="relative flex min-h-[26rem] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:min-h-[30rem]">
        {/* Sin z-index negativo: con position:relative sin z-index, este contenedor no abre un
            contexto de apilamiento propio, así que un -z-10 aquí se escapa y queda detrás del
            fondo de toda la página en vez de solo detrás del texto. El orden en el DOM (este div
            antes que el del texto) ya basta para que quede detrás. */}
        <div className="absolute inset-0">
          <Suspense fallback={<FallbackEstatico />}>
            <HeroEscena3D />
          </Suspense>
        </div>

        <div className="relative z-10 rounded-2xl bg-white/75 px-6 py-8 shadow-sm backdrop-blur-sm sm:px-10">
          <h1 className="text-4xl font-semibold text-slate-800 sm:text-5xl">
            Portal de Proyectos <span className="text-ucp-granate">UCP</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 sm:text-base">
            Estudiantes suben proyectos, profesores los aprueban y la comunidad vota — todo sobre
            una arquitectura cloud contenerizada.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="rounded-lg bg-ucp-verde px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ucp-verde/90"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Crear cuenta
            </Link>
          </div>

          <Link to="/proyectos/pub" className="mt-6 inline-block text-sm text-slate-500 hover:text-ucp-verde hover:underline">
            Ver proyectos públicos
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto h-[28rem] w-full max-w-5xl px-4 sm:h-[32rem] sm:px-6">
            <FallbackEstatico />
          </div>
        }
      >
        <SeccionArquitectura />
      </Suspense>

      {/* Bloque 01 del póster: arquitectura base. Se muestra como "Bloque 02" en la página
          porque el diagrama 3D (SeccionArquitectura, Bloque 02 del póster) se adelantó justo
          debajo del hero — ver la nota de numeración en ese componente. */}
      <Bloque numero="02" titulo="Arquitectura base">
        <p className="max-w-2xl text-sm text-slate-600">
          Los estudiantes suben proyectos, los profesores los aprueban o publican los suyos,
          cualquier visitante consulta y los usuarios autenticados votan.
        </p>
        <Cascada className="mt-5 flex flex-wrap gap-2">
          <Chip>React 18 + Vite</Chip>
          <Chip>Node + Express (ESM)</Chip>
          <Chip>PostgreSQL</Chip>
          <Chip>Docker</Chip>
        </Cascada>

        {/* Núcleo transversal + módulos enchufables, como mini-diagrama (igual idea que el
            Bloque 01 del póster: un núcleo del que cuelgan los módulos de negocio). */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-6 rounded-2xl border border-ucp-verde/25 bg-ucp-verde/5 p-4"
        >
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-ucp-verde">Núcleo transversal</p>
          <Cascada className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Chip icon={KeyRound}>Auth JWT</Chip>
            <Chip icon={ShieldCheck}>Permisos por ruta</Chip>
            <Chip icon={FileText}>Logging</Chip>
            <Chip icon={Bell}>Notificaciones</Chip>
          </Cascada>

          <div className="mx-auto mt-4 h-5 w-px bg-ucp-verde/30" aria-hidden="true" />
          <p className="text-center text-[11px] text-slate-400">módulos enchufables</p>
          <Cascada className="mt-2 flex flex-wrap justify-center gap-2">
            <Chip icon={Layers}>proyectos</Chip>
            <Chip icon={ThumbsUp}>votos</Chip>
            <Chip icon={GitBranch}>aprobaciones</Chip>
          </Cascada>
        </motion.div>

        <Cascada as="ul" className="mt-6 space-y-2 text-sm text-slate-600">
          <PuntoLista icon={ShieldCheck}>
            Permisos granulares: cada ruta declara módulo + acción (READ, WRITE, DELETE).
          </PuntoLista>
          <PuntoLista icon={Fingerprint}>PKs UUID y borrado lógico (is_active): nunca DELETE físico.</PuntoLista>
          <PuntoLista icon={Globe}>Consulta pública en /api/&lt;modulo&gt;/pub con rate limiter propio.</PuntoLista>
        </Cascada>
      </Bloque>

      {/* Bloque 03 del póster: gestión de datos y estado. */}
      <Bloque numero="03" titulo="Gestión de datos y estado">
        <Cascada className="grid gap-4 sm:grid-cols-3">
          <Tarjeta icon={Server} iconClassName="bg-ucp-granate/10 text-ucp-granate" titulo="Backend stateless">
            Sesión en JWT, archivos y datos fuera del contenedor: se replica horizontalmente.
          </Tarjeta>
          <Tarjeta icon={HardDrive} iconClassName="bg-ucp-verde/10 text-ucp-verde" titulo="Volúmenes">
            uploads_vol y pg_data sobreviven a cada redeploy; nunca disco efímero.
          </Tarjeta>
          <Tarjeta icon={Archive} iconClassName="bg-ucp-dorado/10 text-ucp-dorado" titulo="Backups">
            Respaldo automático diario de Postgres + pg_dump manual antes de migrar.
          </Tarjeta>
        </Cascada>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Migración riesgosa, paso a paso
        </p>
        <Cascada className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Chip>1 pg_dump</Chip>
          <motion.span variants={item} aria-hidden="true">
            <ArrowRight size={14} className="text-slate-300" />
          </motion.span>
          <Chip>2 migrate:up</Chip>
          <motion.span variants={item} aria-hidden="true">
            <ArrowRight size={14} className="text-slate-300" />
          </motion.span>
          <Chip>3 si falla: restaurar</Chip>
        </Cascada>
      </Bloque>

      {/* Bloque 04 del póster: proveedor cloud. */}
      <Bloque numero="04" titulo="Proveedor cloud">
        <Cascada className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <motion.div
            variants={item}
            className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-4 text-center sm:text-left"
          >
            <Cloud size={18} className="mx-auto mb-1 text-ucp-granate sm:mx-0" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fase de pruebas</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">Railway</p>
            <p className="text-xs text-slate-500">Plan Hobby · misma imagen, mismo compose</p>
          </motion.div>
          <motion.span variants={item} aria-hidden="true">
            <ArrowRight size={20} className="text-slate-300" />
          </motion.span>
          <motion.div
            variants={item}
            className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-4 text-center sm:text-left"
          >
            <Building2 size={18} className="mx-auto mb-1 text-ucp-verde sm:mx-0" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Destino final</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">Servidor Linux</p>
            <p className="text-xs text-slate-500">Universidad (UCP)</p>
          </motion.div>
        </Cascada>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-600">
          Dos pasos: validar toda la arquitectura en un entorno barato y administrado antes de
          comprometer el servidor institucional.
        </p>
      </Bloque>

      {/* Resultados y conclusiones: no es un bloque del póster, se agregó a pedido del docente. */}
      <Seccion eyebrow="Resultados" icon={TestTube2} titulo="Resultados y conclusiones">
        <Cascada as="ul" className="space-y-2 text-sm text-slate-600">
          <PuntoLista icon={CheckCircle2}>
            Suite de integración completa: 70/70 pruebas verdes contra una instancia real de
            PostgreSQL, sin mocks de base de datos.
          </PuntoLista>
          <PuntoLista icon={RefreshCw}>
            Comportamiento <em>stateless</em> confirmado con datos reales: el conteo de proyectos
            servidos por la API fue idéntico antes y después de forzar la caída del contenedor del
            backend (<code className="text-xs">docker kill</code> + recreación).
          </PuntoLista>
          <PuntoLista icon={HardDrive}>
            Persistencia verificada en los volúmenes con nombre (<code className="text-xs">uploads_vol</code>,{' '}
            <code className="text-xs">pg_data</code>): sobreviven a la destrucción y recreación de
            los contenedores de aplicación.
          </PuntoLista>
          <PuntoLista icon={FileCheck2}>
            Arquitectura completa levantada y probada con <code className="text-xs">docker compose up -d --build</code>{' '}
            en ambos repositorios, consumida a través del único puerto público (nginx) pensado
            para el usuario final.
          </PuntoLista>
        </Cascada>

        <p className="mt-6 max-w-2xl text-sm text-slate-600">
          El diseño PERN + Docker se validó en la práctica, no solo en el papel: el proxy inverso,
          el manejo de sesión sin estado y la persistencia por volúmenes funcionan como estaban
          pensados. Con eso resuelto, el siguiente paso natural es correr el mismo plano en
          Railway (fase de pruebas) antes de comprometer el servidor institucional de la UCP.
        </p>
      </Seccion>

      {/* Referencias: tampoco es un bloque del póster, agregada a pedido del docente (mínimo 4). */}
      <Seccion eyebrow="Referencias" icon={BookOpen} titulo="Referencias">
        <Cascada as="ul" className="grid gap-3 sm:grid-cols-2">
          <Referencia
            numero={1}
            titulo="React — Documentación oficial"
            fuente="Especificación de componentes, hooks y renderizado usada en el frontend."
            href="https://react.dev/"
          />
          <Referencia
            numero={2}
            titulo="Express — Documentación oficial"
            fuente="Framework HTTP sobre el que corre la API REST del backend (Node.js, ESM)."
            href="https://expressjs.com/"
          />
          <Referencia
            numero={3}
            titulo="PostgreSQL — Documentación oficial"
            fuente="Motor de base de datos relacional usado para persistir usuarios, proyectos y votos."
            href="https://www.postgresql.org/docs/"
          />
          <Referencia
            numero={4}
            titulo="Docker Compose — Documentación oficial"
            fuente="Orquestación local de los contenedores frontend, backend y db (docker-compose.yml)."
            href="https://docs.docker.com/compose/"
          />
          <Referencia
            numero={5}
            titulo="RFC 7519 — JSON Web Token (JWT)"
            fuente="Estándar IETF para el token de sesión que viaja en la cookie HttpOnly del portal."
            href="https://datatracker.ietf.org/doc/html/rfc7519"
          />
          <Referencia
            numero={6}
            titulo="Railway — Documentación oficial"
            fuente="Proveedor cloud elegido para la fase de pruebas antes del servidor institucional."
            href="https://docs.railway.com/"
          />
        </Cascada>
      </Seccion>

      <Footer />
    </div>
  );
}
