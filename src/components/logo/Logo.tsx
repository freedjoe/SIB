import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const { theme } = useSettings();

  // Determine dark mode from theme settings
  const isDark =
    theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <>
      <div className={cn("flex flex-col items-center", className)}>
        <span className={cn("font-semibold tracking-tight", sizeClasses[size])}>
          <span className={cn("font-bold", isDark ? "text-white" : "text-black")}>S.I.B</span>
        </span>
        <span className={cn("font-bold text-center", isDark ? "text-white" : "text-black")}>Système d'Information Budgétaire</span>
      </div>
    </>
  );
};

export default Logo;
