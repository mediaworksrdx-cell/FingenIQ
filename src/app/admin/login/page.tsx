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
      background: 'linear-gradient(180deg, #070D1D 0%, #03060C 100%)',
      color: '#E6EDF6',
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
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1.25rem' }}>
            <FinGenIqLogo showText={true} size={46} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h1 id="admin-login-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: '#F1F5F9', margin: 0 }}>
              Staff & Admin Portal
            </h1>
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(206,174,86,0.1)', border: '1px solid rgba(206,174,86,0.3)', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', color: '#CEAE56', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            RESTRICTED ACCESS · SYSTEM ADMINISTRATORS & ENTERPRISE STAFF
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#0B1528',
          border: '1px solid rgba(206,174,86,0.25)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}>
          {state?.error && (
            <div
              role="alert"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                color: '#FCA5A5',
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
              <label htmlFor="admin-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.5rem' }}>
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
                  background: '#070F1E',
                  border: '1px solid #1E293B',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#F8FAFC',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="admin-password" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94A3B8' }}>
                  Security Credential
                </label>
                <Link
                  href="/reset-password/request"
                  style={{ fontSize: '0.75rem', color: '#CEAE56', textDecoration: 'none' }}
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
                  background: '#070F1E',
                  border: '1px solid #1E293B',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#F8FAFC',
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
                background: 'linear-gradient(135deg, #CEAE56 0%, #B8962E 100%)',
                color: '#060A16',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(206,174,86,0.3)',
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
          <Link href="/login" style={{ color: '#CEAE56', textDecoration: 'none', fontWeight: 500 }}>
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
      <div style={{ minHeight: '100vh', background: '#070D1D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CEAE56' }}>
        Loading Admin Gateway...
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
