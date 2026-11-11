import { motion } from 'framer-motion';

// Variantes de framer-motion reutilizadas por toda la app para el scroll-reveal (ver Landing.jsx
// y AGENTS.md — "Componentes compartidos"). `entrada` es para una sección completa que aparece
// de una pieza; `lista`/`item` son el patrón contenedor+hijo para que un grupo de elementos entre
// en cascada (stagger) en vez de todos a la vez.
export const entrada = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export const lista = {
  oculto: {},
  mostrar: { transition: { staggerChildren: 0.07 } },
};

export const item = {
  oculto: { opacity: 0, y: 10 },
  mostrar: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// Grid/fila/lista que anima sus hijos en cascada al entrar en vista. `as` elige la etiqueta
// (por defecto div; "ul" cuando los hijos son <motion.li>, para que siga siendo una lista real).
// Los hijos deben usar `variants={item}` (ver Chip/Tarjeta/PuntoLista) para heredar el stagger.
export default function Cascada({ as = 'div', className, children }) {
  const Etiqueta = motion[as];
  return (
    <Etiqueta variants={lista} initial="oculto" whileInView="mostrar" viewport={{ once: true, margin: '-60px' }} className={className}>
      {children}
    </Etiqueta>
  );
}
