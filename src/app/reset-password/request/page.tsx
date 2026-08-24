'use client';

import { useActionState } from 'react';
import { requestPasswordResetAction } from '@/app/actions/authActions';
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

export default function RequestPasswordReset() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, null);

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
      padding: '2rem 1rem',
    }}>
      <main style={{ width: '100%', maxWidth: 420 }} role="main" aria-labelledby="reset-request-title">
        {/* Brand logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}>
            <FinGenIqLogo showText={true} size={42} />
          </div>
          <h1 id="reset-request-title" style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#E8EEF8', fontWeight: 'normal' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#566078', marginTop: '0.25rem' }}>
            Request a secure password recovery token link.
          </p>
        </div>

        {/* Status/Error Messages */}
        {state?.error && (
          <div role="alert" style={{
            padding: '0.875rem 1rem',
            background: 'rgba(244,63,94,0.06)',
            border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
            color: '#FB7185',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            ⚠️ {state.error}
          </div>
        )}

        {state?.success && state.message && (
          <div role="status" style={{
            padding: '0.875rem 1rem',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
            color: '#34D399',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            ✓ {state.message}
          </div>
        )}

        <div style={{
          background: '#08101E',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          <form action={formAction} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Account Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                style={{
                  background: '#0C1628',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#E6EDF6',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
                placeholder="e.g. user@domain.com"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                color: '#060A16',
                border: '1px solid #CEAE56',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                marginTop: '0.5rem',
              }}
            >
              {isPending ? 'Processing reset...' : 'Generate Reset Token →'}
            </button>
          </form>
        </div>

        <footer role="contentinfo" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.7rem' }}>
          <Link href="/login" style={{ color: '#5E6F85', textDecoration: 'underline' }}>
            Return to Log In
          </Link>
        </footer>
      </main>
    </div>
  );
}
