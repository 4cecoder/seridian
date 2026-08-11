import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const colMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export function ResponsiveGrid({
  children,
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols.sm && colMap[cols.sm],
        cols.md && `md:${colMap[cols.md]}`,
        cols.lg && `lg:${colMap[cols.lg]}`,
        cols.xl && `xl:${colMap[cols.xl]}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
