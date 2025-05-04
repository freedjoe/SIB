import React, { ReactNode } from "react";
import { useAppTranslation } from "@/utils/translation";

interface TranslationWrapperProps {
  translationKey: string;
  module?: string;
  fallback?: string;
  options?: object;
  children?: (translated: string) => ReactNode;
  as?: React.ElementType;
  className?: string;
}

/**
 * A wrapper component that simplifies translations within components
 * Can be used either with render props pattern or as a wrapper
 *
 * Example with render props:
 * <TranslationWrapper translationKey="common.submit" module="app">
 *   {(translated) => <Button>{translated}</Button>}
 * </TranslationWrapper>
 *
 * Example as wrapper:
 * <TranslationWrapper translationKey="title" module="dashboard" as="h2" className="text-2xl" />
 */
export function TranslationWrapper({
  translationKey,
  module,
  fallback = "",
  options = {},
  children,
  as: Component = "span",
  className = "",
}: TranslationWrapperProps) {
  const { t } = useAppTranslation();

  // Determine the translation key path based on whether module is provided
  const fullKey = module ? `${module}.${translationKey}` : translationKey;

  // Get the translated text
  const translated = t(fullKey, options) || fallback || translationKey;

  // If children is a function, use render props pattern
  if (typeof children === "function") {
    return <>{children(translated)}</>;
  }

  // Otherwise, render as the specified component type
  return <Component className={className}>{translated}</Component>;
}

/**
 * A specialized wrapper for form labels
 */
export function TranslatedLabel({ field, module, ...rest }: Omit<TranslationWrapperProps, "translationKey"> & { field: string; module: string }) {
  const { translateLabel } = useAppTranslation();

  return <TranslationWrapper translationKey={`form.${field}`} module={module} fallback={translateLabel("common", field)} {...rest} />;
}

/**
 * A specialized wrapper for buttons
 */
export function TranslatedButton({ action, ...rest }: Omit<TranslationWrapperProps, "translationKey"> & { action: string }) {
  return <TranslationWrapper translationKey={`app.common.${action}`} fallback={action} {...rest} />;
}

/**
 * A specialized wrapper for status values
 */
export function TranslatedStatus({ status, ...rest }: Omit<TranslationWrapperProps, "translationKey"> & { status: string }) {
  return <TranslationWrapper translationKey={`app.common.status.${status}`} fallback={status} {...rest} />;
}
