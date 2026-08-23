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

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  const b2bEntities = entities.filter(e => e.type === 'b2b');
  const b2b2cEntities = entities.filter(e => e.type === 'b2b2c');
  const activeEntities = activeTab === 'b2b' ? b2bEntities : b2b2cEntities;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#042010',
      backgroundImage: 'radial-gradient(ellipse 95% 75% at 20% -10%, rgba(74, 222, 128, 0.38) 0%, transparent 60%), radial-gradient(ellipse 85% 65% at 85% 105%, rgba(163, 230, 53, 0.28) 0%, transparent 55%), linear-gradient(180deg, #052312 0%, #08341A 50%, #041F0E 100%)',
      backgroundAttachment: 'fixed',
      color: '#F0FDF4',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <main style={{ width: '100%', maxWidth: 440 }} role="main" aria-labelledby="login-title">
        {/* Brand logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            textDecoration: 'none',
          }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.9), rgba(6, 40, 18, 0.95))',
              border: '1px solid rgba(74, 222, 128, 0.45)',
              borderRadius: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.35rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 800,
              color: '#4ADE80',
              boxShadow: '0 0 15px rgba(74, 222, 128, 0.3)',
            }}>
              F
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFFFFF', letterSpacing: '-0.02em', fontWeight: 700 }}>
              Fingen<span style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #A3E635 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>IQ</span>
            </span>
          </Link>
          <h1 id="login-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0' }}>
            Portal Sign In
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#86EFAC', marginTop: '0.35rem' }}>
            Authorized access only. Verified credentials required.
          </p>
        </div>

        {/* Error Notification */}
        {state?.error && (
          <div role="alert" style={{
            padding: '0.875rem 1rem',
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.35)',
            borderRadius: '0.75rem',
            fontSize: '0.85rem',
            color: '#FDA4AF',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
            boxShadow: '0 4px 15px rgba(244,63,94,0.2)',
          }}>
            ⚠️ {state.error}
          </div>
        )}

        {/* Form container */}
        <div style={{
          background: 'rgba(8, 38, 18, 0.55)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1px solid rgba(74, 222, 128, 0.25)',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.15)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'rgba(4, 20, 10, 0.65)', border: '1px solid rgba(74, 222, 128, 0.15)', borderRadius: '0.65rem', padding: '0.25rem' }}>
            {(['b2c', 'b2b', 'b2b2c'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  background: activeTab === tab ? 'linear-gradient(135deg, rgba(22, 101, 52, 0.85), rgba(16, 80, 40, 0.95))' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : '#86EFAC',
                  border: activeTab === tab ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid transparent',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {tab === 'b2c' ? 'Learner' : tab === 'b2b' ? 'Enterprise' : 'Partner'}
              </button>
            ))}
          </div>

          <form action={formAction} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="loginCategory" value={activeTab} />
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            
            {activeTab !== 'b2c' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="businessEntityId" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#86EFAC', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {activeTab === 'b2b' ? 'Business Entity' : 'Partner Entity'}
                </label>
                <select
                  id="businessEntityId"
                  name="businessEntityId"
                  required
                  style={{
                    background: 'rgba(4, 24, 12, 0.8)',
                    border: '1px solid rgba(74, 222, 128, 0.25)',
                    borderRadius: '0.65rem',
                    padding: '0.8rem 1rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    width: '100%',
                    appearance: 'none',
                    outline: 'none',
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
              <label htmlFor="email" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#86EFAC', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                style={{
                  background: 'rgba(4, 24, 12, 0.8)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  borderRadius: '0.65rem',
                  padding: '0.8rem 1rem',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  width: '100%',
                  outline: 'none',
                }}
                placeholder="e.g. name@institution.com"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#86EFAC', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <Link href="/reset-password/request" style={{ fontSize: '0.7rem', color: '#4ADE80', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                style={{
                  background: 'rgba(4, 24, 12, 0.8)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  borderRadius: '0.65rem',
                  padding: '0.8rem 1rem',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  width: '100%',
                  outline: 'none',
                }}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)',
                color: '#022C13',
                border: '1px solid #86EFAC',
                borderRadius: '0.65rem',
                padding: '0.875rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              {isPending ? 'Validating credentials...' : 'Sign In →'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#86EFAC', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              System Time: {currentTime ? currentTime.toLocaleString() : 'Loading...'}
            </div>
          </form>
        </div>

        {/* Footer info links */}
        <footer role="contentinfo" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#86EFAC', lineHeight: 1.6 }}>
          <p style={{ color: '#DCFCE7' }}>
            Don&apos;t have credentials? Contact your organization administrator to receive an activation link.
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/admin/login" style={{ color: '#FACC15', textDecoration: 'none', fontWeight: 700 }}>
              🛡️ Enterprise Administrator &amp; Staff Portal Sign In →
            </Link>
            <Link href="/community/login" style={{ color: '#86EFAC', textDecoration: 'none', fontWeight: 600 }}>
              Looking for Community Discussion? Community Sign In / Register →
            </Link>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link href="/" style={{ color: '#4ADE80', textDecoration: 'underline', fontWeight: 600 }}>
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
        background: '#042010',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)'
      }}>
        Loading portal...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
