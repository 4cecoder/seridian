interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "○", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.06] py-16 text-center">
      <span className="mb-3 text-3xl text-slate-600" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-slate-600">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
