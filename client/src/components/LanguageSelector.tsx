import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

export function LanguageSelector() {
  const { language, selectLanguage, availableLanguages } = useLanguage();
  const [open, setOpen] = useState(false);

  // POPUP (only when language not selected)
  if (language === null) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-96">
          <h2 className="text-xl font-bold mb-6 text-center">
            Select Your Language
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => selectLanguage(lang)}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // LANGUAGE SWITCH BUTTON (Navbar version)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 bg-muted rounded-lg text-sm font-medium hover:bg-muted/70 transition"
      >
        {language}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg w-40 z-50">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                selectLanguage(lang);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-muted transition text-sm"
            >
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}