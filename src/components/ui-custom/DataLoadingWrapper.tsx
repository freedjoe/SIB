import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataLoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  skeletonComponent?: ReactNode;
  blurAmount?: "sm" | "md" | "lg";
}

/**
 * A component that adds a blur effect and optional skeleton while data is loading
 */
export function DataLoadingWrapper({ isLoading, children, className, skeletonComponent, blurAmount = "md" }: DataLoadingWrapperProps) {
  const blurClass = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Children always render but are blurred when loading */}
      <div className={cn("transition-all duration-300", isLoading && ["opacity-20", blurClass[blurAmount], "pointer-events-none"])}>{children}</div>

      {/* Skeleton overlay that appears when loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          {skeletonComponent || (
            <div className="space-y-3 w-[90%]">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
