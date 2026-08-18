'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { loginAction } from '@/app/actions/authActions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'b2b2c'>('b2c');
  const [entities, setEntities] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch active business entities from public endpoint
    fetch('/api/entities')
      .then(res => res.json())
      .then(data => {
        if (data.entities) {
          setEntities(data.entities);
        }
      })
      .catch(err => console.error("Error fetching entities:", err));
  }, []);

  useEffect(() => {
    // If incoming redirect is for community, forward immediately to community auth
    if (redirectTo && redirectTo.startsWith('/community')) {
      window.location.href = `/community/login?redirect=${encodeURIComponent(redirectTo)}`;
    }
  }, [redirectTo]);

  if (state?.success && state.redirectUrl) {
    if (typeof window !== 'undefined') {
      window.location.href = state.redirectUrl;
    }
  }

  const b2bEntities = entities.filter(e => e.type === 'b2b');
  const b2b2cEntities = entities.filter(e => e.type === 'b2b2c');

  const activeEntities = activeTab === 'b2b' ? b2bEntities : b2b2cEntities;

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
      <main style={{ width: '100%', maxWidth: 420 }} role="main" aria-labelledby="login-title">
        {/* Brand logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #183070, #050F24)',
              border: '1px solid rgba(184,150,46,0.35)',
              borderRadius: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
              fontFamily: 'Georgia, serif',
              color: '#CEAE56',
            }}>
              F
            </div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.35rem', color: '#E6EDF6', letterSpacing: '-0.02em', fontWeight: 'normal' }}>
              Fingen<span style={{ color: '#B8962E' }}>IQ</span>
            </span>
          </div>
          <h1 id="login-title" style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#E8EEF8', fontWeight: 'normal' }}>
            Portal Sign In
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#566078', marginTop: '0.25rem' }}>
            Authorized access only. Verified credentials required.
          </p>
        </div>

        {/* Error Notification */}
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

        {/* Form container */}
        <div style={{
          background: '#08101E',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#0C1628', borderRadius: '0.5rem', padding: '0.25rem' }}>
            {(['b2c', 'b2b', 'b2b2c'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: activeTab === tab ? '#183070' : 'transparent',
                  color: activeTab === tab ? '#E6EDF6' : '#566078',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'b2c' ? 'Individual' : tab === 'b2b' ? 'Enterprise' : 'Partner'}
              </button>
            ))}
          </div>

          <form action={formAction} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="loginCategory" value={activeTab} />
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            
            {activeTab !== 'b2c' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="businessEntityId" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {activeTab === 'b2b' ? 'Business Entity' : 'Partner Entity'}
                </label>
                <select
                  id="businessEntityId"
                  name="businessEntityId"
                  required
                  style={{
                    background: '#0C1628',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#E6EDF6',
                    fontSize: '0.875rem',
                    width: '100%',
                    appearance: 'none',
                  }}
                >
                  <option value="">Select Entity...</option>
                  {activeEntities.map((entity: any) => (
                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email Address
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
                placeholder="e.g. name@institution.com"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9AAABF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <Link href="/reset-password/request" style={{ fontSize: '0.65rem', color: '#B8962E', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
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
                placeholder="••••••••••••"
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
              {isPending ? 'Validating credentials...' : 'Sign In →'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#566078', fontSize: '0.65rem', fontFamily: 'monospace' }}>
              System Time: {currentTime ? currentTime.toLocaleString() : 'Loading...'}
            </div>
          </form>
        </div>

        {/* Footer info links */}
        <footer role="contentinfo" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.7rem', color: '#5E6F85', lineHeight: 1.6 }}>
          <p>
            Don&apos;t have credentials? Contact your organization administrator to receive an activation link.
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/admin/login" style={{ color: '#CEAE56', textDecoration: 'none', fontWeight: 600 }}>
              🛡️ Enterprise Administrator & Staff Portal Sign In →
            </Link>
            <Link href="/community/login" style={{ color: '#8898AA', textDecoration: 'none', fontWeight: 500 }}>
              Looking for Community Discussion? Community Sign In / Register →
            </Link>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link href="/" style={{ color: '#5E6F85', textDecoration: 'underline' }}>
              Return to Homepage
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#060A16',
        color: '#E6EDF6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Segoe UI, system-ui, sans-serif'
      }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
