import "@/components/ui/badge";
import "@/components/ui/select";

declare module "@/components/ui/badge" {
  export interface BadgeProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | "info";
  }
}

// This is needed for custom theme modifications
declare module "@/components/ui/select" {
  export interface SelectProps {
    // Add any custom props for Select here if needed
  }
}
