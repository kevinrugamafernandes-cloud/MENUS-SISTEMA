// ErrorMessage - Componente para mostrar errores de forma clara en español

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = "Algo salió mal",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Ícono de error */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}