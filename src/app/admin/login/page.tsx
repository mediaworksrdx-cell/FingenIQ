'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { loginAction } from '@/app/actions/authActions';
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

function AdminLoginContent() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (state?.success && state.redirectUrl) {
    if (typeof window !== 'undefined') {
      window.location.href = state.redirectUrl;
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F5',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(180, 83, 9, 0.06) 0%, transparent 60%), #FAF8F5',
      color: '#0F172A',
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      <main style={{ width: '100%', maxWidth: 440 }} role="main" aria-labelledby="admin-login-title">
        {/* Brand logo & Badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '1.25rem' }}>
            <FinGenIqLogo showText={true} size={46} />
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h1 id="admin-login-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Staff & Admin Portal
            </h1>
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(180, 83, 9, 0.08)', border: '1px solid rgba(180, 83, 9, 0.25)', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.7rem', color: '#B45309', fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
            RESTRICTED ACCESS · SYSTEM ADMINISTRATORS & ENTERPRISE STAFF
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
        }}>
          {state?.error && (
            <div
              role="alert"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                color: '#BE123C',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="loginCategory" value="b2c" />
            <input type="hidden" name="redirectTo" value="/admin/credentials" />

            <div>
              <label htmlFor="admin-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#334155', marginBottom: '0.5rem' }}>
                Administrator / Staff Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue="admin@fingeniq.com"
                placeholder="admin@fingeniq.com"
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="admin-password" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#334155' }}>
                  Security Credential
                </label>
                <Link
                  href="/reset-password/request"
                  style={{ fontSize: '0.75rem', color: '#B45309', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot Key?
                </Link>
              </div>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(180, 83, 9, 0.3)',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isPending ? 'Authenticating...' : 'Authenticate & Enter Console →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
              System Time: {currentTime ? currentTime.toLocaleString() : 'Syncing...'}
            </div>
          </form>
        </div>

        {/* Back to Student Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748B' }}>
          Are you a student or learner?{' '}
          <Link href="/login" style={{ color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
            Go to Student Portal →
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
        Loading Admin Gateway...
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
