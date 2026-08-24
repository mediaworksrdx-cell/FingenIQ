'use client';

import { useActionState, useState, useEffect, Suspense } from 'react';
import { communityLoginAction, communityRegisterAction } from '@/app/actions/communityAuthActions';
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';
import { useSearchParams } from 'next/navigation';

function CommunityAuthContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/community';

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  const [loginState, loginFormAction, isLoginPending] = useActionState(communityLoginAction, null);
  const [registerState, registerFormAction, isRegisterPending] = useActionState(communityRegisterAction, null);

  useEffect(() => {
    if (loginState?.success && loginState.redirectUrl) {
      window.location.href = loginState.redirectUrl;
    }
  }, [loginState]);

  useEffect(() => {
    if (registerState?.success && registerState.redirectUrl) {
      window.location.href = registerState.redirectUrl;
    }
  }, [registerState]);

  const activeError = activeTab === 'signin' ? loginState?.error : registerState?.error;
  const isPending = activeTab === 'signin' ? isLoginPending : isRegisterPending;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0A1428 0%, #060A16 70%)',
      color: '#E6EDF6',
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <main style={{ width: '100%', maxWidth: 440 }} role="main" aria-labelledby="community-auth-title">
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/community" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <FinGenIqLogo size={38} />
            <span className="nav__logo-text" style={{ fontSize: '1.55rem' }}>
              <span className="logo-fin">Fin</span>
              <span className="logo-gen">Gen</span>
              <span className="logo-iq">IQ</span>
              <span style={{ fontSize: '1.05rem', color: '#9AAABF', fontFamily: 'Inter, sans-serif', fontWeight: 300, marginLeft: '0.5rem' }}>Community</span>
            </span>
          </Link>
          <h1 id="community-auth-title" style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#E8EEF8', fontWeight: 500, margin: '0.5rem 0 0.25rem' }}>
            {activeTab === 'signin' ? 'Sign In to Community' : 'Join the Community'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#8898AA', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
            {activeTab === 'signin'
              ? 'Access research discussions, post comments, and engage with peers.'
              : 'Create your free community account to comment and participate in financial research.'}
          </p>
        </div>

        {/* Error notification */}
        {activeError && (
          <div role="alert" style={{
            padding: '0.875rem 1rem',
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
            color: '#FB7185',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
          }}>
            ⚠️ {activeError}
          </div>
        )}

        {/* Auth Card */}
        <div style={{
          background: '#08101E',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Dual Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#0C1628', borderRadius: '0.5rem', padding: '0.25rem' }}>
            <button
              onClick={() => setActiveTab('signin')}
              type="button"
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                background: activeTab === 'signin' ? '#183070' : 'transparent',
                color: activeTab === 'signin' ? '#E6EDF6' : '#566078',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              type="button"
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                background: activeTab === 'register' ? '#183070' : 'transparent',
                color: activeTab === 'register' ? '#E6EDF6' : '#566078',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form action={loginFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="login-email" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
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
                  cursor: isPending ? 'default' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  marginTop: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                {isPending ? 'Signing In...' : 'Sign In to Community →'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form action={registerFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-name" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Full Name
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-email" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-password" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Password (min. 8 characters)
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-confirm" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
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
                  cursor: isPending ? 'default' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  marginTop: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                {isPending ? 'Creating Account...' : 'Create Free Account →'}
              </button>
            </form>
          )}
        </div>

        {/* Footer & Institutional Platform Link */}
        <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#6A7B95', lineHeight: 1.6 }}>
          <p>
            Enrolled in curriculum tracks or institutional training?
          </p>
          <div style={{ marginTop: '0.4rem' }}>
            <Link href="/login" style={{ color: '#B8962E', textDecoration: 'none', fontWeight: 600 }}>
              Institutional LMS Portal Sign In →
            </Link>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <Link href="/community" style={{ color: '#8898AA', textDecoration: 'none' }}>
              ← Return to Community Articles
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function CommunityAuthPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#060A16',
        color: '#E6EDF6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Loading...
      </div>
    }>
      <CommunityAuthContent />
    </Suspense>
  );
}
