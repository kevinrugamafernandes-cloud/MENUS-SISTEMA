// LoginPage — Fase 6 corregido
// Identidad: US men — Unification System
// Redirección correcta por rol.

import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    if (user.role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (user.role === "KITCHEN") {
      navigate("/kitchen", { replace: true });
    } else if (user.role === "CASHIER") {
      navigate("/cashier", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Ingresa tu usuario");
      return;
    }

    if (!password) {
      setError("Ingresa tu contraseña");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ name: name.trim(), password });
      // La redirección la maneja el useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-xs">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl mb-8 shadow-brand-900/50">
            <span className="text-5xl">🍽️</span>
          </div>

          <h1 className="text-5xl font-black text-white tracking-tight mb-2">US men</h1>
          <p className="text-brand-400 text-sm font-semibold tracking-[0.2em] uppercase mb-8">
            Unification System
          </p>

          <p className="text-gray-500 text-sm leading-relaxed">
            Sistema de gestión digital para restaurantes. Control total desde la mesa hasta la caja.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              "Menú digital por código QR",
              "Panel de cocina en tiempo real",
              "Caja y reportes integrados",
              "Administración completa",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs">✓</span>
                </span>
                <span className="text-gray-400 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-black text-white">US men</h1>
            <p className="text-brand-500 text-xs tracking-widest uppercase mt-0.5">
              Unification System
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-800 shadow-2xl">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>
              <p className="text-gray-500 text-sm mt-1">Accede a tu panel de administración</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="login-name"
                  className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Usuario
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  autoComplete="username"
                  autoFocus
                  placeholder="admin"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl px-4 py-3.5 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl px-4 py-3.5 text-sm placeholder:text-gray-600 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
                  >
                    {showPass ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800/60 text-red-300 px-4 py-3 rounded-2xl text-sm">
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all text-sm mt-2 shadow-lg shadow-brand-900/40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Entrar al sistema →"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-700 text-xs mt-6">
            US men — Unification System · v6.0
          </p>

          {import.meta.env.DEV && (
            <p className="text-center text-gray-700 text-xs mt-2">
              DEV: admin / admin123
            </p>
          )}
        </div>
      </div>
    </div>
  );
}