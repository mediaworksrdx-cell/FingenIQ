'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

const PUBLIC_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/curriculum', label: 'Curriculum' },
  { href: '/community', label: 'Community' },
  { href: '/mentor', label: 'Mentor' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact Us' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.name) {
          setSessionUser({ name: data.name, role: data.role });
        } else {
          setSessionUser(null);
        }
      })
      .catch(() => setSessionUser(null));
  }, [pathname]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setSessionUser(null);
    window.location.href = '/';
  };

  const portalHref = sessionUser?.role === 'admin'
    ? '/admin/credentials'
    : sessionUser?.role === 'community_member'
    ? '/community'
    : '/dashboard';

  const portalLabel = sessionUser?.role === 'admin'
    ? 'Admin Suite →'
    : sessionUser?.role === 'community_member'
    ? 'Community Feed →'
    : 'Dashboard →';

  return (
    <>
      <nav
        className="nav"
        aria-label="Public navigation"
      >
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="FinGen IQ home">
            <FinGenIqLogo showText={true} size={36} />
          </Link>

          {/* Desktop Links */}
          <div className="nav__links" style={{ flex: 'none' }}>
            {PUBLIC_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav__link${pathname === l.href ? ' active' : ''}`}
                aria-current={pathname === l.href ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Desktop CTA (Hidden on mobile via CSS) */}
            {sessionUser ? (
              <div className="nav__desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <a
                  href={portalHref}
                  className="btn btn--brass"
                  style={{
                    animation: 'pulseGlow 3s ease-in-out infinite',
                    animationDelay: '1.5s',
                  }}
                >
                  {portalLabel}
                </a>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: '0.5rem',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748B',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="btn btn--brass nav__desktop-cta"
                style={{
                  animation: 'pulseGlow 3s ease-in-out infinite',
                  animationDelay: '1.5s',
                }}
              >
                Enter FingenIQ →
              </a>
            )}

            {/* Mobile hamburger (Visible only on mobile/tablet) */}
            <button
              className="nav__hamburger"
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(v => !v)}
            >
              <span style={{ transform: drawerOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
              <span style={{ opacity: drawerOpen ? 0 : 1 }} />
              <span style={{ transform: drawerOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`nav__drawer-overlay${drawerOpen ? ' open' : ''}`}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <nav
        className={`nav__drawer${drawerOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
        role="navigation"
      >
        <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-600)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--sp-4)' }}>
          Navigation
        </div>
        {PUBLIC_LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav__drawer-link${pathname === l.href ? ' active' : ''}`}
            onClick={() => setDrawerOpen(false)}
            aria-current={pathname === l.href ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-6)', borderTop: 'var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sessionUser ? (
            <>
              <a
                href={portalHref}
                className="btn btn--brass"
                style={{ width: '100%', textAlign: 'center', display: 'block' }}
                onClick={() => setDrawerOpen(false)}
              >
                {portalLabel}
              </a>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#DC2626',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.65rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="btn btn--brass"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
              onClick={() => setDrawerOpen(false)}
            >
              Enter FingenIQ →
            </a>
          )}
        </div>
      </nav>
    </>
  );
}
