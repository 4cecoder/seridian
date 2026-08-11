import { Separator } from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const hasHeader = title || actions;

  return (
    <div className={cn("space-y-4", className)}>
      {hasHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
      <Separator className="bg-white/[0.06]" />
    </div>
  );
}
