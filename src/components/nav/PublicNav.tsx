'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PUBLIC_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/community', label: 'Community' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
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

        <div style={{ marginLeft: 'auto' }}>
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
  );
}
