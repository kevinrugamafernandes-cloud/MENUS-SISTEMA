// LoadingSpinner - Indicador de carga reutilizable

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = "Cargando...", fullScreen = false }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex flex-col items-center justify-center bg-gray-50"
    : "flex flex-col items-center justify-center py-16";

  return (
    <div className={containerClass}>
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
}