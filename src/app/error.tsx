'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    console.error('Application Error caught by error boundary:', error);
    const isChunk =
      error.message?.includes('chunk') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Server Action') ||
      error.message?.includes('Failed to fetch');

    setIsChunkError(!!isChunk);

    if (isChunk) {
      const lastReload = sessionStorage.getItem('last_auto_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('last_auto_reload', now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060A16',
      color: '#E6EDF6',
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: 440,
        background: '#0B1528',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '2.5rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'rgba(206,174,86,0.15)',
          color: '#CEAE56',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          margin: '0 auto 1.25rem'
        }}>
          {isChunkError ? '⚡' : '⚠️'}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 0.5rem' }}>
          {isChunkError ? 'Platform Updated' : 'Something went wrong'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#8898AA', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
          {isChunkError
            ? 'A newer deployment is available. Click below to refresh your session.'
            : 'An unexpected error occurred. Please try again or return to the homepage.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => {
              if (isChunkError) {
                sessionStorage.clear();
                window.location.href = window.location.pathname;
              } else {
                reset();
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #CEAE56 0%, #B8962E 100%)',
              color: '#060A16',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {isChunkError ? 'Refresh & Reload Platform →' : 'Try Again ↺'}
          </button>
          <a
            href="/"
            style={{
              color: '#8898AA',
              fontSize: '0.8rem',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
