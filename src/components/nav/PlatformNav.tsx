'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { USER_STATE } from '@/lib/data';

const NAV_LINKS = [
  { href: '/dashboard',          label: 'Dashboard',    icon: '◈' },
  { href: '/lessons',            label: 'Lessons',      icon: '◉' },
  { href: '/assessments',        label: 'Assessments',  icon: '✎', dot: true },
  { href: '/capstone',           label: 'Capstone',     icon: '◐' },
  { href: '/certification',      label: 'Certification',icon: '⬡' },
  { href: '/marketplace',        label: 'Marketplace',  icon: '◈' },
  { href: '/certification-roadmap', label: 'SEBI',      icon: '⬡' },
];

const PROGRESS_PCT = (() => {
  const { progress } = USER_STATE;
  return Math.round((progress.lessonsCompleted / progress.totalLessons) * 100);
})();

export default function PlatformNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { initials, certification } = USER_STATE;
  const hasTier = !!certification.tier;

  return (
    <>
      <nav className="nav" aria-label="Platform navigation">
        <div className="nav__inner">
          {/* Logo */}
          <Link href="/" className="nav__logo" aria-label="FingenIQ home">
            <div className="nav__logo-mark">
              <span className="nav__logo-glyph">F</span>
            </div>
            <span className="nav__logo-text">Fingen<span>IQ</span></span>
          </Link>

          {/* Desktop Links */}
          <div className="nav__links" role="menubar" aria-label="Main navigation">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                className={`nav__link${pathname === l.href ? ' active' : ''}`}
                aria-current={pathname === l.href ? 'page' : undefined}
              >
                <span className="nav__link-icon" aria-hidden="true">{l.icon}</span>
                {l.label}
                {l.dot && <span className="nav__dot" aria-label="New activity" />}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="nav__user">
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

            {/* Avatar with optional tier ring */}
            <div
              className={`nav__avatar${hasTier ? ' nav__tier-ring' : ''}`}
              title={USER_STATE.name}
              role="img"
              aria-label={`User: ${USER_STATE.name}${hasTier ? `, Tier: ${certification.tier}` : ''}`}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Progress bar underline */}
        <div className="nav__progress-bar" role="progressbar" aria-valuenow={PROGRESS_PCT} aria-valuemin={0} aria-valuemax={100} aria-label="Overall course progress">
          <div
            className="nav__progress-fill"
            style={{ width: `${PROGRESS_PCT}%`, ['--nav-progress' as string]: `${PROGRESS_PCT}%` }}
          />
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
          Platform
        </div>
        {NAV_LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav__drawer-link${pathname === l.href ? ' active' : ''}`}
            onClick={() => setDrawerOpen(false)}
            aria-current={pathname === l.href ? 'page' : undefined}
          >
            <span aria-hidden="true">{l.icon}</span>
            {l.label}
            {l.dot && (
              <span style={{ width: 6, height: 6, borderRadius: '9999px', background: 'var(--rose-400)', marginLeft: 'auto' }} aria-label="New" />
            )}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-6)', borderTop: 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3)' }}>
            <div className="nav__avatar" style={{ width: 36, height: 36, fontSize: 'var(--text-xs)' }}>{initials}</div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)' }}>{USER_STATE.name}</div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>{PROGRESS_PCT}% complete</div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
