// NotFoundPage — Fase 6: identidad US men

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center
                    px-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                      bg-gradient-to-br from-brand-500 to-brand-700 mb-6 shadow-2xl">
        <span className="text-4xl">🍽️</span>
      </div>
      <h1 className="text-5xl font-black text-white mb-2">404</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-6">
        Esta página no existe o fue movida.
      </p>
      <a href="/"
         className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
        ← Volver al inicio
      </a>
      <p className="text-gray-800 text-xs mt-12 tracking-widest uppercase">
        US men · Unification System
      </p>
    </div>
  );
}