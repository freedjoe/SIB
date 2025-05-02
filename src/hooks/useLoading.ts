import { useState, useEffect } from "react";

interface UseLoadingOptions {
  dependencies?: any[];
  initialLoading?: boolean;
  message?: string;
}

/**
 * Custom hook to manage loading states across the application
 * Can be used in two ways:
 * 1. useLoading() - returns { isLoading, setLoading, loadingMessage }
 * 2. useLoading([isLoading1, isLoading2], options) - tracks multiple loading states
 *
 * @param loadingStates - Optional array of boolean loading states to track
 * @param options - Configuration options
 * @returns Loading state and customizable loading message
 */
export function useLoading(loadingStates?: boolean[] | UseLoadingOptions, options: UseLoadingOptions = {}) {
  // Handle the case where first argument is options
  if (loadingStates && !Array.isArray(loadingStates)) {
    options = loadingStates;
    loadingStates = undefined;
  }

  const { dependencies = [], initialLoading = false, message = "Chargement des données..." } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);

  // If loadingStates is provided, track them
  useEffect(() => {
    if (loadingStates && Array.isArray(loadingStates)) {
      // If any loading state is true, the overall loading state is true
      const anyLoading = loadingStates.some((state) => state === true);
      setIsLoading(anyLoading);
    }
  }, [...(loadingStates || []), ...dependencies]);

  // Function to manually set loading state
  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return {
    isLoading,
    setLoading,
    loadingMessage: message,
  };
}
