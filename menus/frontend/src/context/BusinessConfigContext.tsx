// BusinessConfigContext — Fase 5
// Carga la config pública del negocio una sola vez y la provee globalmente.
// Usada por el cliente QR para personalizar nombre, bienvenida, etc.

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BusinessConfig }     from "../types";
import { fetchPublicConfig }  from "../services/api.service";

interface BusinessConfigContextValue {
  config:    BusinessConfig | null;
  loading:   boolean;
}

const BusinessConfigContext = createContext<BusinessConfigContextValue>({
  config:  null,
  loading: true,
});

export function BusinessConfigProvider({ children }: { children: ReactNode }) {
  const [config,  setConfig]  = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicConfig()
      .then((res) => setConfig(res.data))
      .catch(() => {/* silencioso — usa defaults del componente */})
      .finally(() => setLoading(false));
  }, []);

  return (
    <BusinessConfigContext.Provider value={{ config, loading }}>
      {children}
    </BusinessConfigContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBusinessConfig(): BusinessConfigContextValue {
  return useContext(BusinessConfigContext);
}