
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardProps {
  children: ReactNode;
  className?: string;
}

export function Dashboard({ children, className }: DashboardProps) {
  return (
    <div 
      className={cn(
        "page-container animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-balance">
              {description}
            </p>
          )}
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({
  children,
  columns = 3,
  className,
}: DashboardGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <div className={cn("mb-8", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
