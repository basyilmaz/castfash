"use client";

import en from "./en.json";
import tr from "./tr.json";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "en" | "tr";

const translations: Record<Lang, Record<string, string>> = { en, tr };

// Get initial language from localStorage
const getInitialLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("lang");
  return (stored === "en" || stored === "tr") ? stored : "en";
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // SSR uyumluluğu için localStorage'dan dil durumu yüklenir
  useEffect(() => {
    setLangState(getInitialLang());
  }, []);

  const setLang = (value: Lang) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", value);
    }
  };

  const t = useMemo(() => {
    return (key: string) => {
      const dict = translations[lang];
      return dict[key] ?? key;
    };
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
