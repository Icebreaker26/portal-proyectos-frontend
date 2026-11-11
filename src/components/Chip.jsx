import { motion } from 'framer-motion';
import { item } from './Cascada.jsx';

// Pastilla pequeña (stack, tag, paso de un flujo). Usar dentro de <Cascada> para que entre
// en cascada con sus hermanos.
export default function Chip({ icon: Icon, children }) {
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
