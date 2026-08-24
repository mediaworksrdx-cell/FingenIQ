'use client';

import { useActionState, use } from 'react';
import { resetPasswordAction } from '@/app/actions/authActions';
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

export default function ResetPassword({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  if (state?.success && state.redirectUrl) {
    if (typeof window !== 'undefined') {
      window.location.href = state.redirectUrl;
    }
  }

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
      padding: '2rem 1rem',
    }}>
      <main style={{ width: '100%', maxWidth: 460 }} role="main" aria-labelledby="reset-title">
        {/* Brand logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}>
            <FinGenIqLogo showText={true} size={42} />
          </Link>
          <h1 id="reset-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#0F172A', fontWeight: 700 }}>
            Choose a New Password
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
            Set a new secure password to access your account.
          </p>
        </div>

        {/* Error Notification */}
        {state?.error && (
          <div role="alert" style={{
            padding: '0.875rem 1rem',
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
            color: '#BE123C',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            ⚠️ {state.error}
          </div>
        )}

        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
        }}>
          {/* Rules block */}
          <div style={{
            background: '#F4F1EA',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            fontSize: '0.75rem',
            color: '#475569',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>Password Requirements:</strong>
            • Minimum 10 characters length<br />
            • At least 1 uppercase &amp; 1 lowercase letter<br />
            • At least 1 numerical digit &amp; 1 special symbol
          </div>

          <form action={formAction} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="token" value={token} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="password" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                New Secure Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
                placeholder="••••••••••••"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="confirmPassword" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Confirm Secure Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                marginTop: '0.5rem',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
              }}
            >
              {isPending ? 'Updating Password...' : 'Save Password →'}
            </button>
          </form>
        </div>

        <footer role="contentinfo" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem' }}>
          <Link href="/login" style={{ color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
            Cancel and Return to Sign In
          </Link>
        </footer>
      </main>
    </div>
  );
}
