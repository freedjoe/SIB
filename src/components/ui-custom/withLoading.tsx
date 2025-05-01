import React, { ComponentType } from "react";
import { PageLoadingSpinner } from "./PageLoadingSpinner";
import { DataLoadingWrapper } from "./DataLoadingWrapper";

interface WithLoadingProps {
  isLoading?: boolean;
  loadingMessage?: string;
  useBlur?: boolean;
  blurAmount?: "sm" | "md" | "lg";
  [key: string]: any;
}

/**
 * Higher-order component that adds loading behavior to page components
 *
 * @param Component - The component to wrap
 * @param defaultMessage - Default loading message
 * @returns A new component with loading behavior
 */
export function withLoading<P extends object>(Component: ComponentType<P>, defaultMessage: string = "Chargement des données...") {
  return function WithLoadingComponent({
    isLoading = false,
    loadingMessage = defaultMessage,
    useBlur = true,
    blurAmount = "md",
    ...props
  }: WithLoadingProps & P) {
    // Full-page loading spinner when data is initially loading
    if (isLoading && !useBlur) {
      return <PageLoadingSpinner message={loadingMessage} />;
    }

    // Blur effect with component still visible underneath
    if (isLoading && useBlur) {
      return (
        <DataLoadingWrapper isLoading={isLoading} blurAmount={blurAmount} showSpinner={true} loadingMessage={loadingMessage}>
          <Component {...(props as P)} />
        </DataLoadingWrapper>
      );
    }

    // Normal render when not loading
    return <Component {...(props as P)} />;
  };
}
