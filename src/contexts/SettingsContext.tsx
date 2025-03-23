
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

type Theme = "light" | "dark" | "system";
type Language = "en" | "fr" | "ar";

interface SettingsContextType {
  theme: Theme;
  language: Language;
  direction: "ltr" | "rtl";
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "system"
  );
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem("language") as Language) || "fr"
  );

  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", language);
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, direction, i18n]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        direction,
        setTheme,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
