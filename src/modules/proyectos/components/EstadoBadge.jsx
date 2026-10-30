const ESTILOS = {
  aprobado: 'bg-ucp-verde/10 text-ucp-verde',
  pendiente: 'bg-ucp-dorado/10 text-ucp-dorado',
  rechazado: 'bg-ucp-rojo/10 text-ucp-rojo',
};

export default function EstadoBadge({ estado }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${ESTILOS[estado] || 'bg-slate-100 text-slate-600'}`}
    >
      {estado}
    </span>
  );
}
