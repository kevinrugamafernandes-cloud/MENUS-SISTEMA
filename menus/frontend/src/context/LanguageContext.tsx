// LanguageContext — Fase 6
// Proveedor de idioma para el cliente QR.
// El idioma se persiste en localStorage para que no se pierda al recargar.
// El panel admin NO usa este contexto — mantiene español interno.

import {
  createContext, useContext, useState, useEffect,
  ReactNode, useCallback,
} from "react";
import { Lang, StringKey, t as translate } from "../utils/ui-strings";

interface LanguageContextValue {
  lang:        Lang;
  setLang:     (l: Lang) => void;
  t:           (key: StringKey) => string;
  hasChosen:   boolean;   // true si el usuario ya eligió idioma en esta sesión
  confirmLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang:        "es",
  setLang:     () => {},
  t:           (key) => translate("es", key),
  hasChosen:   false,
  confirmLang: () => {},
});

const STORAGE_KEY = "menus_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Leer idioma guardado; si no existe, mostrará selector
  const stored   = (typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY) as Lang | null
    : null);

  const [lang,      setLangState] = useState<Lang>(stored ?? "es");
  const [hasChosen, setHasChosen] = useState<boolean>(!!stored);

  useEffect(() => {
    if (stored) setHasChosen(true);
  }, []); // eslint-disable-line

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
  }, []);

  // Confirmar elección de idioma y persistirla
  const confirmLang = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    setHasChosen(true);
  }, [lang]);

  const tFn = useCallback(
    (key: StringKey) => translate(lang, key),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: tFn, hasChosen, confirmLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}