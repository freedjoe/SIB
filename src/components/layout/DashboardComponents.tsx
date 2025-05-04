import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/utils/translation";

interface DashboardProps {
  children: ReactNode;
  className?: string;
}

function Dashboard({ children, className }: DashboardProps) {
  return <div className={cn("page-container animate-fade-in", className)}>{children}</div>;
}

interface DashboardHeaderProps {
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  module?: string;
  children?: ReactNode;
  className?: string;
}

function DashboardHeader({ title, titleKey, description, descriptionKey, module, children, className }: DashboardHeaderProps) {
  const { t } = useAppTranslation();

  // Determine the title to display with translations
  const displayTitle = titleKey ? (module ? t(`${module}.${titleKey}`) : t(titleKey)) : title;

  // Determine the description to display with translations
  const displayDescription = descriptionKey ? (module ? t(`${module}.${descriptionKey}`) : t(descriptionKey)) : description;

  return (
    <div className={cn("mb-8 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
          {displayDescription && <p className="text-muted-foreground mt-1 text-balance">{displayDescription}</p>}
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

function DashboardGrid({ children, columns = 3, className }: DashboardGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={cn("grid gap-4", gridCols[columns], className)}>{children}</div>;
}

interface DashboardSectionProps {
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  module?: string;
  children: ReactNode;
  className?: string;
}

function DashboardSection({ title, titleKey, description, descriptionKey, module, children, className }: DashboardSectionProps) {
  const { t } = useAppTranslation();

  // Determine the title to display with translations
  const displayTitle = titleKey ? (module ? t(`${module}.${titleKey}`) : t(titleKey)) : title;

  // Determine the description to display with translations
  const displayDescription = descriptionKey ? (module ? t(`${module}.${descriptionKey}`) : t(descriptionKey)) : description;

  return (
    <div className={cn("mb-8", className)}>
      {(displayTitle || displayDescription) && (
        <div className="mb-4">
          {displayTitle && <h2 className="text-xl font-semibold">{displayTitle}</h2>}
          {displayDescription && <p className="text-muted-foreground text-sm mt-1">{displayDescription}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export { Dashboard, DashboardHeader, DashboardSection, DashboardGrid };
