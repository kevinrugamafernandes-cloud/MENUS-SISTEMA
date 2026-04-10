// LanguageSelector — Fase 6
// Pantalla inicial de selección de idioma para el cliente QR.
// Se muestra solo una vez por sesión (hasta que el usuario confirma).

import { useState } from "react";
import { Lang }     from "../../utils/ui-strings";
import { useLanguage } from "../../context/LanguageContext";

const LANGUAGES: { code: Lang; label: string; flag: string; native: string }[] = [
  { code: "es", label: "Español",  flag: "🇪🇸", native: "Español" },
  { code: "en", label: "English",  flag: "🇺🇸", native: "English" },
];

export function LanguageSelector() {
  const { lang, setLang, confirmLang } = useLanguage();
  const [selected, setSelected] = useState<Lang>(lang);

  function handleConfirm() {
    setLang(selected);
    // Pequeño delay para que setLang se propague antes de ocultar
    setTimeout(() => confirmLang(), 50);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">

      {/* Logotipo del sistema */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                        bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl mb-5">
          <span className="text-4xl">🍽️</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">US men</h1>
        <p className="text-gray-500 text-sm mt-1 tracking-widest uppercase">
          Unification System
        </p>
      </div>

      {/* Selector */}
      <div className="w-full max-w-xs">
        <p className="text-gray-400 text-sm text-center mb-5 font-medium">
          {selected === "es" ? "Elige tu idioma" : "Choose your language"}
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelected(l.code)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left
                          transition-all duration-150 font-semibold text-base
                          ${selected === l.code
                            ? "border-brand-500 bg-brand-500/10 text-white"
                            : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500"}`}
            >
              <span className="text-3xl">{l.flag}</span>
              <div>
                <p className="font-bold text-base">{l.native}</p>
              </div>
              {selected === l.code && (
                <span className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center
                                 justify-center text-white text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4
                     rounded-2xl transition-colors text-base shadow-lg"
        >
          {selected === "es" ? "Continuar →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}