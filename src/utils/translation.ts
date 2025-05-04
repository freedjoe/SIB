import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";

// Helper function to translate with variables
export function translate(key: string, options?: object): string {
  return i18n.t(key, options);
}

// Custom hook with commonly used translation patterns
export function useAppTranslation() {
  const { t, i18n } = useTranslation();

  // Create translations for common UI patterns
  const translateWithModule = (module: string, key: string, options?: object): string => {
    return t(`${module}.${key}`, options);
  };

  // Translate form labels consistently
  const translateLabel = (module: string, field: string, options?: object): string => {
    return t(`${module}.form.${field}`, options) || t(`app.common.${field}`, options) || field;
  };

  // Translate button text consistently
  const translateButton = (action: string, options?: object): string => {
    return t(`app.common.${action}`, options) || action;
  };

  // Translate status values with consistent formatting
  const translateStatus = (status: string, options?: object): string => {
    return t(`app.common.status.${status}`, status);
  };

  // Helper to get current language
  const getCurrentLanguage = (): string => {
    return i18n.language;
  };

  // Helper to check if text should be right-to-left
  const isRTL = (): boolean => {
    return i18n.language === "ar";
  };

  // Helper to change language
  const changeLanguage = (lang: string) => {
    return i18n.changeLanguage(lang);
  };

  return {
    t,
    i18n,
    translate: t,
    translateWithModule,
    translateLabel,
    translateButton,
    translateStatus,
    getCurrentLanguage,
    isRTL,
    changeLanguage,
  };
}

// Helper to ensure consistent module translation structure
export const moduleNamespace = {
  dashboard: "dashboard",
  programs: "programs",
  portfolios: "portfolios",
  actions: "actions",
  operations: "operations",
  engagements: "engagements",
  payments: "payments",
  reports: "reports",
  audit: "audit",
  previsionsCP: "PrevisionsCP",
  expenses: "expenses",
  fiscalYears: "fiscalYears",
  settings: "settings",
  chat: "chat",
};

// Export all module namespaces in a type-safe way
export type ModuleNamespace = keyof typeof moduleNamespace;
