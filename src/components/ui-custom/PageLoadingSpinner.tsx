import React from "react";

interface PageLoadingSpinnerProps {
  message?: string;
}

export function PageLoadingSpinner({ message = "Chargement des données..." }: PageLoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <svg className="animate-spin h-12 w-12 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="text-lg text-muted-foreground text-center">{message}</span>
    </div>
  );
}
