'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error global capturado:', error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ 
        margin: 0, 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1rem'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '2rem',
          backgroundColor: '#1e293b',
          borderRadius: '1rem',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Error Crítico
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Ocurrió un error crítico en la aplicación. Por favor, recarga la página o contacta al soporte.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
          >
            🔄 Recargar aplicación
          </button>
        </div>
      </body>
    </html>
  );
}
