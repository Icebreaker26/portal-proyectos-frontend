// Estado vacío genérico ("todavía no hay X") — antes cada vista improvisaba su propio <p>.
export default function EmptyState({ icon: Icon, titulo, children }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
      {Icon && <Icon size={28} className="text-slate-300" />}
      <p className="text-sm font-medium text-slate-600">{titulo}</p>
      {children && <p className="max-w-sm text-sm text-slate-400">{children}</p>}
    </div>
  );
}
