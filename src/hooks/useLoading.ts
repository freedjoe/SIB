import { useState, useEffect } from "react";

interface UseLoadingOptions {
  dependencies?: any[];
  initialLoading?: boolean;
  message?: string;
}

/**
 * Custom hook to manage loading states across the application
 * @param loadingStates - Array of boolean loading states to track
 * @param options - Configuration options
 * @returns Loading state and customizable loading message
 */
export function useLoading(loadingStates: boolean[], options: UseLoadingOptions = {}) {
  const { dependencies = [], initialLoading = false, message = "Chargement des données..." } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    // If any loading state is true, the overall loading state is true
    const anyLoading = loadingStates.some((state) => state === true);
    setIsLoading(anyLoading);
  }, [...loadingStates, ...dependencies]);

  return {
    isLoading,
    loadingMessage: message,
  };
}
