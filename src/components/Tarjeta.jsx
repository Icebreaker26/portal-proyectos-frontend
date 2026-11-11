import { motion } from 'framer-motion';
import { item } from './Cascada.jsx';

// Tarjeta pequeña con icono + título + texto corto, para grids de características. Usar dentro
// de <Cascada> para que entre en cascada con sus hermanas.
export default function Tarjeta({ icon: Icon, iconClassName, titulo, children }) {
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
