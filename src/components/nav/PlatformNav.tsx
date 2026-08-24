'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { USER_STATE } from '@/lib/data';
import { logoutAction, changePasswordAction } from '@/app/actions/authActions';
import PlatformAiTutor from '@/components/chat/PlatformAiTutor';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

const NAV_LINKS = [
  { href: '/dashboard',          label: 'Dashboard',    icon: '◈' },
  { href: '/lessons',            label: 'Lessons',      icon: '◉' },
  { href: '/assessments',        label: 'Assessments',  icon: '✎', dot: true },
  { href: '/capstone',           label: 'Capstone',     icon: '◐' },
  { href: '/certification',      label: 'Certification',icon: '⬡' },
  { href: '/certification-roadmap', label: 'SEBI',      icon: '⬡' },
];

const PROGRESS_PCT = (() => {
  const { progress } = USER_STATE;
  return Math.round((progress.lessonsCompleted / progress.totalLessons) * 100);
})();

export default function PlatformNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ name: string; role: string; email?: string } | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { initials, certification } = USER_STATE;
  const hasTier = !!certification.tier;

  // Fetch session data
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.name) {
          setSessionUser({ name: data.name, role: data.role, email: data.email });
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      await logoutAction();
    } catch {}
    window.location.href = '/login';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
      const res = await changePasswordAction(null, formData);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: res.message || 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = sessionUser?.name || USER_STATE.name;
  const displayRole = sessionUser?.role === 'admin' ? 'Administrator' : 'Learner';

  return (
    <>
      <nav className="nav" aria-label="Platform navigation">
        <div className="nav__inner">
          {/* Logo */}
          <Link href={sessionUser?.role === 'admin' ? '/admin/credentials' : '/dashboard'} className="nav__logo" aria-label="FinGen IQ platform">
            <FinGenIqLogo size={28} />
            <span className="nav__logo-text">
              <span className="logo-fin">Fin</span>
              <span className="logo-gen">Gen</span>
              <span className="logo-iq">IQ</span>
            </span>
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

          {/* Right side: User & Settings */}
          <div className="nav__user" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* AI Tutor Button */}
            <button
              onClick={() => setAiTutorOpen(true)}
              aria-label="Open AI Financial Tutor"
              style={{
                background: 'linear-gradient(135deg, rgba(206,174,86,0.15), rgba(184,150,46,0.05))',
                border: '1px solid rgba(206,174,86,0.4)',
                borderRadius: '0.5rem',
                padding: '0.4rem 0.85rem',
                color: '#CEAE56',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#CEAE56'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(206,174,86,0.4)'}
            >
              <span>✨</span>
              <span>AI Tutor</span>
            </button>

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

            {/* Avatar button with dropdown trigger */}
            <button
              onClick={() => setUserDropdownOpen(v => !v)}
              aria-label="User account menu"
              aria-expanded={userDropdownOpen}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                className={`nav__avatar${hasTier ? ' nav__tier-ring' : ''}`}
                title={displayName}
                role="img"
                aria-label={`User: ${displayName}${hasTier ? `, Tier: ${certification.tier}` : ''}`}
              >
                {initials}
              </div>
            </button>

            {/* Desktop User Dropdown Menu */}
            {userDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: 250,
                  background: '#0B1528',
                  border: '1px solid rgba(206,174,86,0.25)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                  zIndex: 1000,
                  animation: 'fadeUp 0.2s ease-out',
                }}
              >
                {/* User Header */}
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>{displayName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#B8962E', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {displayRole} {certification.tier ? `• ${certification.tier}` : ''}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#8898AA', marginTop: '2px' }}>
                    {PROGRESS_PCT}% curriculum complete
                  </div>
                </div>

                {/* Dropdown Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setSettingsModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: '#E6EDF6',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>⚙️</span>
                    <span>Account Settings</span>
                  </button>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'transparent',
                      borderRadius: '0.375rem',
                      color: '#E6EDF6',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>📊</span>
                    <span>Learning Dashboard</span>
                  </Link>

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.35rem 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: '#FB7185',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
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

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-6)', borderTop: 'var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-2)' }}>
            <div className="nav__avatar" style={{ width: 36, height: 36, fontSize: 'var(--text-xs)' }}>{initials}</div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)' }}>{displayName}</div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>{PROGRESS_PCT}% complete</div>
            </div>
          </div>

          <button
            onClick={() => {
              setDrawerOpen(false);
              setAiTutorOpen(true);
            }}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: 'rgba(206,174,86,0.12)',
              border: '1px solid rgba(206,174,86,0.35)',
              borderRadius: '0.5rem',
              color: '#CEAE56',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            ✨ AI Financial Tutor
          </button>

          <button
            onClick={() => {
              setDrawerOpen(false);
              setSettingsModalOpen(true);
            }}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              color: '#E6EDF6',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            ⚙️ Account Settings
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: '0.5rem',
              color: '#FB7185',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </nav>

      {/* Account Settings Modal */}
      {settingsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 6, 15, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            animation: 'fadeUp 0.2s ease-out',
          }}
          onClick={() => setSettingsModalOpen(false)}
        >
          <div
            style={{
              background: '#0B1528',
              border: '1px solid rgba(206,174,86,0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSettingsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: '#94A3B8',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #183070, #050F24)',
                border: '1px solid rgba(184,150,46,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#CEAE56',
              }}>
                ⚙️
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Account Settings</h3>
                <p style={{ fontSize: '0.75rem', color: '#8898AA', margin: '2px 0 0' }}>Manage your profile &amp; security credentials</p>
              </div>
            </div>

            {/* Profile Info Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>Learner Name</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0', marginTop: '2px' }}>{displayName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>Portal Role</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CEAE56', marginTop: '2px' }}>{displayRole}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>Progress</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981', marginTop: '2px' }}>{PROGRESS_PCT}% Complete</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>Credential Tier</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0', marginTop: '2px' }}>{certification.tier || 'In Progress'}</div>
              </div>
            </div>

            {/* Change Password Section */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.75rem' }}>Security: Change Password</h4>
            
            {passwordMsg && (
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                marginBottom: '1rem',
                background: passwordMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                border: passwordMsg.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(244,63,94,0.3)',
                color: passwordMsg.type === 'success' ? '#34D399' : '#FB7185',
              }}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: '#060A16',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    color: '#E6EDF6',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#060A16',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.5rem',
                      color: '#E6EDF6',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Confirm New
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#060A16',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.5rem',
                      color: '#E6EDF6',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                    color: '#060A16',
                    border: '1px solid #CEAE56',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(244,63,94,0.08)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    borderRadius: '0.5rem',
                    color: '#FB7185',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform AI Tutor Drawer */}
      <PlatformAiTutor isOpen={aiTutorOpen} onClose={() => setAiTutorOpen(false)} />
    </>
  );
}
