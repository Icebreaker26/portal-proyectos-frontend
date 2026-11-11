import { motion } from 'framer-motion';
import { item } from './Cascada.jsx';

// Ítem de lista con icono a la izquierda. Usar como hijo de <Cascada as="ul">.
export default function PuntoLista({ icon: Icon, children }) {
  return (
    <motion.li variants={item} className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-ucp-verde" />
      <span>{children}</span>
    </motion.li>
  );
}
