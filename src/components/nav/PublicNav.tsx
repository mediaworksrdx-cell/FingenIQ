'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  return (
    <>
      <nav
        className="nav"
        aria-label="Public navigation"
        style={{
          background: scrolled
            ? 'rgba(6, 10, 22, 0.97)'
            : 'rgba(6, 10, 22, 0.82)',
          backdropFilter: scrolled ? 'blur(32px) saturate(200%)' : 'blur(16px) saturate(140%)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.05)',
          transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="FingenIQ home">
            <div className="nav__logo-mark">
              <span className="nav__logo-glyph">F</span>
            </div>
            <span className="nav__logo-text">Fingen<span>IQ</span></span>
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

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            {/* Mobile hamburger */}
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

            <Link
              href="/login"
              className="btn btn--brass"
              style={{
                animation: 'pulseGlow 3s ease-in-out infinite',
                animationDelay: '1.5s',
              }}
            >
              Enter FingenIQ →
            </Link>
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

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-6)', borderTop: 'var(--border-subtle)' }}>
          <Link
            href="/login"
            className="btn btn--brass"
            style={{ width: '100%', textAlign: 'center', display: 'block' }}
            onClick={() => setDrawerOpen(false)}
          >
            Enter FingenIQ →
          </Link>
        </div>
      </nav>
    </>
  );
}
