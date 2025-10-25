'use client';

import Link from 'next/link';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="text-center p-8 max-w-lg bg-slate-800/80 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
        <div className="text-8xl mb-6 animate-bounce">🔍</div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-3">
          Página no encontrada
        </h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="navigation-button px-8 py-3 inline-flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            <span>Volver al inicio</span>
          </Link>
          <button
            onClick={handleGoBack}
            className="px-8 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold hover:bg-slate-600 transition-all border border-slate-600 hover:border-slate-500 inline-flex items-center justify-center gap-2"
          >
            <span>←</span>
            <span>Volver atrás</span>
          </button>
        </div>
      </div>
    </div>
  );
}
