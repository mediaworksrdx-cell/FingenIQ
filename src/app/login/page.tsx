'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { loginAction } from '@/app/actions/authActions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

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
      background: '#FAF8F5',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(22, 163, 74, 0.06) 0%, transparent 60%), #FAF8F5',
      color: '#0F172A',
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
            marginBottom: '0.75rem',
            textDecoration: 'none',
          }}>
            <FinGenIqLogo showText={true} size={44} />
          </Link>
          <h1 id="login-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#0F172A', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0' }}>
            Portal Sign In
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.35rem' }}>
            Authorized access only. Verified credentials required.
          </p>
        </div>

        {/* Error Notification */}
        {state?.error && (
          <div role="alert" style={{
            padding: '0.875rem 1rem',
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: '0.75rem',
            fontSize: '0.85rem',
            color: '#E11D48',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
            boxShadow: '0 4px 15px rgba(244,63,94,0.1)',
          }}>
            ⚠️ {state.error}
          </div>
        )}

        {/* Form container */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#F4F1EA', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '0.65rem', padding: '0.25rem' }}>
            {(['b2c', 'b2b', 'b2b2c'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  background: activeTab === tab ? '#15803D' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(21, 128, 61, 0.3)' : 'none',
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
                <label htmlFor="businessEntityId" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {activeTab === 'b2b' ? 'Business Entity' : 'Partner Entity'}
                </label>
                <select
                  id="businessEntityId"
                  name="businessEntityId"
                  required
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    borderRadius: '0.65rem',
                    padding: '0.8rem 1rem',
                    color: '#0F172A',
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
              <label htmlFor="email" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue="learner@fingeniq.com"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '0.65rem',
                  padding: '0.8rem 1rem',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  width: '100%',
                  outline: 'none',
                }}
                placeholder="e.g. learner@fingeniq.com"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <Link href="/reset-password/request" style={{ fontSize: '0.7rem', color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="Learner@123456"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '0.65rem',
                  padding: '0.8rem 1rem',
                  color: '#0F172A',
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
                background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.65rem',
                padding: '0.875rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
                boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
              }}
            >
              {isPending ? 'Validating credentials...' : 'Sign In →'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#64748B', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              System Time: {currentTime ? currentTime.toLocaleString() : 'Loading...'}
            </div>
          </form>
        </div>

        {/* Demo Credentials Box */}
        <div style={{
          marginTop: '1.25rem',
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '0.75rem',
          padding: '1rem',
          fontSize: '0.75rem',
          color: '#334155',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🔑 Available System Credentials:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#15803D' }}>📖 Learner</div>
              <div style={{ fontSize: '0.7rem', color: '#475569' }}>learner@fingeniq.com</div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Learner@123456</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#7C3AED' }}>🎓 Teacher</div>
              <div style={{ fontSize: '0.7rem', color: '#475569' }}>teacher@fingeniq.com</div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Teacher@123456</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#2563EB' }}>💼 Employee</div>
              <div style={{ fontSize: '0.7rem', color: '#475569' }}>employee@fingeniq.com</div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Employee@123456</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#B45309' }}>🛡️ Admin</div>
              <div style={{ fontSize: '0.7rem', color: '#475569' }}>admin@fingeniq.com</div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Admin@123456</div>
            </div>
          </div>
        </div>

        {/* Footer info links */}
        <footer role="contentinfo" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/admin/login" style={{ color: '#B45309', textDecoration: 'none', fontWeight: 700 }}>
              🛡️ Admin, Employee &amp; Teacher Portal Sign In →
            </Link>
            <Link href="/community/login" style={{ color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
              Looking for Community Discussion? Community Sign In / Register →
            </Link>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link href="/" style={{ color: '#15803D', textDecoration: 'underline', fontWeight: 600 }}>
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
        background: '#FAF8F5',
        color: '#0F172A',
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
