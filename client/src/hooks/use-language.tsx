import { createContext, useContext, useState } from "react";
import { translations, TranslationKeys } from "@/languages/translations";

type LanguageContextType = {
  language: string | null;
  t: TranslationKeys;
  selectLanguage: (lang: string) => void;
  availableLanguages: string[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<string | null>(null);

  const selectLanguage = (lang: string) => {
    setLanguage(lang);
  };

  const currentLanguage = language ?? "English";
  const t = translations[currentLanguage];

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        selectLanguage,
        availableLanguages: Object.keys(translations),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}