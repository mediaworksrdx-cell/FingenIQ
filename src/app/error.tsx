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
      background: '#FAF8F5',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(22, 163, 74, 0.06) 0%, transparent 60%), #FAF8F5',
      color: '#0F172A',
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
        background: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '1rem',
        padding: '2.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'rgba(22, 163, 74, 0.1)',
          color: '#15803D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          margin: '0 auto 1.25rem'
        }}>
          {isChunkError ? '⚡' : '⚠️'}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>
          {isChunkError ? 'Platform Updated' : 'Something went wrong'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
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
              background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
            }}
          >
            {isChunkError ? 'Refresh & Reload Platform →' : 'Try Again ↺'}
          </button>
          <a
            href="/"
            style={{
              color: '#15803D',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
