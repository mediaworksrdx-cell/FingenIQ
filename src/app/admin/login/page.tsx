'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { loginAction } from '@/app/actions/authActions';
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

const ROLE_PRESETS = [
  {
    role: 'admin',
    label: '🛡️ Admin',
    desc: 'Full Super-Admin Control & Governance',
    badgeColor: '#B45309',
  },
  {
    role: 'employee',
    label: '💼 Employee',
    desc: 'Institutional Staff & Moderation',
    badgeColor: '#2563EB',
  },
  {
    role: 'teacher',
    label: '🎓 Teacher',
    desc: 'Academic Faculty & Curriculum',
    badgeColor: '#7C3AED',
  },
];

function AdminLoginContent() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | 'teacher'>('admin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

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

  const handleSelectRole = (preset: typeof ROLE_PRESETS[0]) => {
    setSelectedRole(preset.role as any);
  };

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
      <main style={{ width: '100%', maxWidth: 480 }} role="main" aria-labelledby="admin-login-title">
        {/* Brand logo & Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FinGenIqLogo showText={true} size={46} />
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h1 id="admin-login-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Staff &amp; Admin Portal
            </h1>
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(180, 83, 9, 0.08)', border: '1px solid rgba(180, 83, 9, 0.25)', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.7rem', color: '#B45309', fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
            RESTRICTED ACCESS · ADMIN, EMPLOYEE &amp; TEACHER
          </div>
        </div>

        {/* Quick Role Selector */}
        <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {ROLE_PRESETS.map(preset => {
            const isSelected = selectedRole === preset.role;
            return (
              <button
                key={preset.role}
                type="button"
                onClick={() => handleSelectRole(preset)}
                style={{
                  background: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  border: isSelected ? `2px solid ${preset.badgeColor}` : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '0.65rem',
                  padding: '0.6rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? preset.badgeColor : '#334155' }}>
                  {preset.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>
                  {preset.role === 'admin' ? 'Super Admin' : preset.role === 'employee' ? 'Staff' : 'Faculty'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '1rem',
          padding: '1.75rem',
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
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>⚠️ {state.error}</span>
            </div>
          )}

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <input type="hidden" name="loginCategory" value="b2c" />
            <input type="hidden" name="redirectTo" value="/admin/credentials" />

            <div>
              <label htmlFor="admin-email" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#334155', marginBottom: '0.4rem' }}>
                {selectedRole.toUpperCase()} EMAIL ADDRESS
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="name@fingeniq.com"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="admin-password" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#334155' }}>
                  PASSWORD / SECURITY KEY
                </label>
                <Link
                  href="/reset-password/request"
                  style={{ fontSize: '0.72rem', color: '#B45309', textDecoration: 'none', fontWeight: 600 }}
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
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
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
                background: selectedRole === 'teacher'
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : selectedRole === 'employee'
                  ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                  : 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '0.25rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              }}
            >
              {isPending ? 'Verifying Credentials...' : `Sign In as ${selectedRole.toUpperCase()} →`}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.25rem', color: '#94A3B8', fontSize: '0.68rem', fontFamily: 'monospace' }}>
              System Time: {currentTime ? currentTime.toLocaleString() : 'Loading...'}
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748B' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/login" style={{ color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
              ← Learner Portal Login
            </Link>
            <span>•</span>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
              Return to Homepage
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
        Loading security portal...
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
