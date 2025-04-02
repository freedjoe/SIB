import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <>
      <div className={cn("flex flex-col items-center", className)}>
        <span className={cn("font-semibold tracking-tight", sizeClasses[size])}>
          <span className="font-bold">S.I.B</span>
        </span>
        <span className="font-bold text-center">Système d’Information Budgétaire</span>
      </div>
    </>
  );
};

export default Logo;
