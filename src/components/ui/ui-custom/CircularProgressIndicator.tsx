import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CircularProgressIndicatorProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  showValue?: boolean;
  valueSize?: number;
  label?: string;
  labelSize?: number;
  className?: string;
}

export const CircularProgressIndicator: React.FC<CircularProgressIndicatorProps> = ({
  value,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color = "primary",
  showValue = false,
  valueSize = 16,
  label,
  labelSize = 14,
  className,
}) => {
  const [progress, setProgress] = useState(0);

  // Normalize value to be between 0 and max
  const normalizedValue = Math.min(Math.max(0, value), max);

  // Calculate the percentage
  const percentage = (normalizedValue / max) * 100;

  // Calculate radius and center point
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Calculate circumference
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash offset
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Colors based on the theme
  const getStrokeColor = () => {
    switch (color) {
      case "primary":
        return "stroke-primary";
      case "secondary":
        return "stroke-secondary";
      case "success":
        return "stroke-green-500";
      case "warning":
        return "stroke-yellow-500";
      case "danger":
        return "stroke-red-500";
      case "info":
        return "stroke-blue-500";
      default:
        return "stroke-primary";
    }
  };

  // Animate the progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="opacity-10" />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          strokeLinecap="round"
          className={cn(getStrokeColor(), "transition-all duration-1000 ease-out")}
        />
      </svg>

      {/* Center text for the percentage */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ fontSize: valueSize }}>
          <span className="font-medium">{Math.round(percentage)}%</span>
          {label && (
            <span className="text-muted-foreground mt-1" style={{ fontSize: labelSize }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
