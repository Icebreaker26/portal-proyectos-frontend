import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const ESTILOS = {
  aprobado: { clase: 'bg-ucp-verde/10 text-ucp-verde', icon: CheckCircle2 },
  pendiente: { clase: 'bg-ucp-dorado/10 text-ucp-dorado', icon: Clock },
  rechazado: { clase: 'bg-ucp-rojo/10 text-ucp-rojo', icon: XCircle },
};

export default function EstadoBadge({ estado }) {
  const { clase, icon: Icon } = ESTILOS[estado] || { clase: 'bg-slate-100 text-slate-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${clase}`}>
      {Icon && <Icon size={12} />}
      {estado}
    </span>
  );
}
