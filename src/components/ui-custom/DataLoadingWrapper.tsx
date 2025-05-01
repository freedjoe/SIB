import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataLoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  skeletonComponent?: ReactNode;
  blurAmount?: "sm" | "md" | "lg";
  loadingMessage?: string;
  showSpinner?: boolean;
}

/**
 * A component that adds a blur effect and optional skeleton while data is loading
 */
export function DataLoadingWrapper({
  isLoading,
  children,
  className,
  skeletonComponent,
  blurAmount = "md",
  loadingMessage,
  showSpinner = false,
}: DataLoadingWrapperProps) {
  const blurClass = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Children always render but are blurred when loading */}
      <div className={cn("transition-all duration-300", isLoading && ["opacity-20", blurClass[blurAmount], "pointer-events-none"])}>{children}</div>

      {/* Skeleton overlay or spinner that appears when loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          {showSpinner ? (
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              {loadingMessage && <span className="text-lg text-muted-foreground text-center">{loadingMessage}</span>}
            </div>
          ) : (
            skeletonComponent || (
              <div className="space-y-3 w-[90%]">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
