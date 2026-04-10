// main.tsx — Fase 6 (versión final)
// Orden de providers:
//   AuthProvider         → sesión global
//   BusinessConfigProvider → config del negocio (pública)
//   LanguageProvider     → idioma del cliente QR
//   App                  → rutas

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider }           from "./context/AuthContext";
import { BusinessConfigProvider } from "./context/BusinessConfigContext";
import { LanguageProvider }       from "./context/LanguageContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BusinessConfigProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BusinessConfigProvider>
    </AuthProvider>
  </React.StrictMode>
);