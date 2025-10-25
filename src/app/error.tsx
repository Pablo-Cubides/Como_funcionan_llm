'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error('Error capturado en boundary:', error);
    
    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="text-center p-8 max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-6xl mb-4 animate-pulse">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">
          Algo salió mal
        </h2>
        <p className="text-slate-400 mb-2">
          Ocurrió un error inesperado al procesar tu solicitud.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400">
              Detalles técnicos (solo en desarrollo)
            </summary>
            <pre className="mt-2 text-xs bg-slate-900 p-3 rounded overflow-auto text-red-400">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="navigation-button px-6 py-3"
          >
            <span>🔄</span>
            <span>Intentar de nuevo</span>
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold hover:bg-slate-600 transition-all border border-slate-600 hover:border-slate-500 inline-flex items-center gap-2"
          >
            <span>🏠</span>
            <span>Volver al inicio</span>
          </a>
        </div>
      </div>
    </div>
  );
}
