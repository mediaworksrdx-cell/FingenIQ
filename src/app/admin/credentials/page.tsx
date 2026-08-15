'use client';

import { useActionState, useState, useEffect, useTransition } from 'react';
import { createCredentialAction, toggleAccountStatusAction, forceResetAction, renewCredentialAction, updateLessonResourcesAction } from '@/app/actions/adminActions';
import { logoutAction } from '@/app/actions/authActions';
import { LESSONS } from '@/lib/data';
import Link from 'next/link';

export default function AdminCredentials() {
  const [sessionToken, setSessionToken] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedYoutubeId, setSelectedYoutubeId] = useState('');
  const [selectedPdfPath, setSelectedPdfPath] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, locked: 0, disabled: 0, expiring: 0, expired: 0 });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Renewal state
  const [renewUserId, setRenewUserId] = useState<string | null>(null);
  const [renewPeriod, setRenewPeriod] = useState<'monthly' | 'quarterly' | 'half_yearly' | 'annual'>('monthly');

  const [createState, createFormAction, isCreatePending] = useActionState(async (state: any, formData: FormData) => {
    const res = await createCredentialAction(sessionToken, formData);
    if (res.success) {
      fetchDashboardData();
    }
    return res;
  }, null);

  const [isPending, startTransition] = useTransition();

  const fetchDashboardData = () => {
    // Read session token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];
    if (token) setSessionToken(token);

    // Call API helper to load stats, user tables, and audit logs statefully
    fetch('/api/admin/data')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setUsersList(data.users);
          setAuditLogs(data.auditLogs);
        }
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleStatus = (userId: string, actionType: 'lock' | 'unlock' | 'disable' | 'enable') => {
    startTransition(async () => {
      const res = await toggleAccountStatusAction(sessionToken, userId, actionType);
      if (res.success) fetchDashboardData();
      else alert(res.error);
    });
  };

  const handleForceReset = (userId: string) => {
    startTransition(async () => {
      const res = await forceResetAction(sessionToken, userId);
      if (res.success) {
        alert('Password reset forced. User will be redirected to reset password page on next action.');
        fetchDashboardData();
      } else {
        alert(res.error);
      }
    });
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewUserId) return;
    const res = await renewCredentialAction(sessionToken, renewUserId, renewPeriod);
    if (res.success) {
      alert(`Account renewed successfully. New Expiration: ${new Date(res.newExpiresAt || '').toLocaleDateString('en-IN')}`);
      setRenewUserId(null);
      fetchDashboardData();
    } else {
      alert(res.error);
    }
  };

  useEffect(() => {
    if (!selectedLessonId) {
      setSelectedYoutubeId('');
      setSelectedPdfPath('');
      return;
    }
    const lesson = LESSONS.find(l => l.id === selectedLessonId);
    if (lesson) {
      setSelectedYoutubeId(lesson.youtubeId || '');
      setSelectedPdfPath(lesson.pdfPath || '');
    }
  }, [selectedLessonId]);

  const handleLessonUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    const res = await updateLessonResourcesAction(sessionToken, selectedLessonId, selectedYoutubeId, selectedPdfPath);
    if (res.success) {
      alert('Lesson resources updated successfully! Refresh the page or play the lesson to see the changes.');
      const idx = LESSONS.findIndex(l => l.id === selectedLessonId);
      if (idx !== -1) {
        LESSONS[idx].youtubeId = selectedYoutubeId || undefined;
        LESSONS[idx].pdfPath = selectedPdfPath || undefined;
      }
    } else {
      alert(res.error);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/login';
  };

  return (
    <div className="platform surface--dark" style={{ minHeight: '100vh', background: '#050810', color: '#E8EEF8' }}>
      {/* Header bar */}
      <nav className="nav" style={{ background: '#08101E', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="nav__inner" style={{ maxWidth: 'var(--ultra-max)' }}>
          <Link href="/" className="nav__logo">
            <div className="nav__logo-mark"><span className="nav__logo-glyph">F</span></div>
            <span className="nav__logo-text">Fingen<span>IQ</span></span>
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--dm-text-secondary)', fontWeight: 600 }}>🏛 SYSTEM ADMINISTRATOR</span>
            <button className="btn btn--outline btn--xs" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="page-wrapper" style={{ paddingTop: 'calc(var(--nav-height) + var(--sp-6))' }}>
        <main className="page-main">
          <div className="container">
            {/* Header Title */}
            <div style={{ marginBottom: 'var(--sp-8)' }}>
              <div className="page-hero__label">Control Center</div>
              <h1 className="page-hero__title" style={{ fontSize: 'var(--text-3xl)', color: '#E8EEF8' }}>Credential Management</h1>
              <p className="page-hero__subtitle" style={{ color: '#9AAABF' }}>
                Create invite tokens, manual temp credentials, lock profiles, renew validity periods, and review SEBI compliance audit trails.
              </p>
            </div>

            {/* Top summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
              {[
                { label: 'Total Accounts', value: stats.total, color: 'var(--sapphire-400)' },
                { label: 'Active', value: stats.active, color: 'var(--emerald-400)' },
                { label: 'Pending Activation', value: stats.pending, color: 'var(--amber-400)' },
                { label: 'Locked Out', value: stats.locked, color: 'var(--rose-400)' },
                { label: 'Expiring (≤14d)', value: stats.expiring, color: 'var(--amber-500)' },
                { label: 'Expired', value: stats.expired, color: 'var(--rose-600)' },
              ].map((s, idx) => (
                <div key={idx} className="card p-5" style={{ background: '#0C1628', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#5E6F85', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  <div className="num" style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 380px', gap: 'var(--sp-8)' }}>
              {/* Left Column: Create Credentials and Users Table */}
              <div className="dashboard-main" style={{ gap: 'var(--sp-8)' }}>
                
                {/* Form to issue credential */}
                <section className="card p-6" style={{ background: '#08101E', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#E8EEF8', marginBottom: 'var(--sp-5)', fontFamily: 'var(--font-sans)' }}>
                    Provision New Access Credential
                  </h2>

                  <form action={createFormAction} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name" style={{ color: '#9AAABF' }}>Full Name *</label>
                      <input id="name" name="name" type="text" className="form-input" required placeholder="e.g. Priyesh Shah" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="email" style={{ color: '#9AAABF' }}>Email Address *</label>
                      <input id="email" name="email" type="email" className="form-input" required placeholder="e.g. priyesh@firm.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="role" style={{ color: '#9AAABF' }}>Access Role *</label>
                      <select id="role" name="role" className="form-input" style={{ appearance: 'auto', background: '#0C1628' }}>
                        <option value="learner">Learner (Curriculum access)</option>
                        <option value="employer">Employer (Marketplace access)</option>
                        <option value="admin">Administrator (Full systems control)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="validityPeriod" style={{ color: '#9AAABF' }}>Validity Period *</label>
                      <select id="validityPeriod" name="validityPeriod" className="form-input" style={{ appearance: 'auto', background: '#0C1628' }}>
                        <option value="monthly">Monthly Access</option>
                        <option value="quarterly">Quarterly Access</option>
                        <option value="half_yearly">Half-Yearly Access</option>
                        <option value="annual">Annual Access</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label" style={{ color: '#9AAABF' }}>Credential Delivery Method *</label>
                      <div style={{ display: 'flex', gap: 'var(--sp-6)', marginTop: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                          <input type="radio" name="deliveryMethod" value="link" defaultChecked style={{ width: 16, height: 16 }} />
                          One-Time Invite Link (Recommended)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                          <input type="radio" name="deliveryMethod" value="password" style={{ width: 16, height: 16 }} />
                          Temporary Password (Manual handoff)
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="btn btn--brass" style={{ gridColumn: 'span 2', marginTop: 'var(--sp-2)' }} disabled={isCreatePending}>
                      {isCreatePending ? 'Generating credentials...' : 'Issue Access Credential →'}
                    </button>
                  </form>

                  {/* Confirmation link displays */}
                  {createState?.success && (
                    <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-5)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-lg)' }}>
                      <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        ✓ Access Credential Provisioned
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
                        Credential is created. Copy the details below. Validity starts on first client activation.
                      </p>
                      {createState.tempPassword && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.65rem', color: '#5E6F85', display: 'block', textTransform: 'uppercase' }}>Temporary Password (One-Time Display)</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <code style={{ fontSize: 'var(--text-sm)', color: '#E8EEF8', padding: '4px 10px', background: '#0C1628', borderRadius: 4 }}>{createState.tempPassword}</code>
                            <button className="btn btn--outline btn--xs" onClick={() => navigator.clipboard.writeText(createState.tempPassword || '')}>Copy</button>
                          </div>
                        </div>
                      )}
                      {createState.activationLink && (
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#5E6F85', display: 'block', textTransform: 'uppercase' }}>Activation URL invite link</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <code style={{ fontSize: 'var(--text-xs)', color: '#E8EEF8', padding: '4px 10px', background: '#0C1628', borderRadius: 4, wordBreak: 'break-all', flex: 1 }}>{createState.activationLink}</code>
                            <button className="btn btn--outline btn--xs" onClick={() => navigator.clipboard.writeText(createState.activationLink || '')}>Copy</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {createState?.error && (
                    <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-lg)', color: '#FB7185', fontSize: 'var(--text-xs)' }}>
                      ⚠️ {createState.error}
                    </div>
                  )}
                </section>

                {/* Users List Table */}
                <section className="card p-7" style={{ background: '#08101E', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#E8EEF8', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Provisioned Users &amp; Expiries
                  </h2>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Term</th>
                          <th>Expires On</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((user: any) => {
                          const isExpired = user.accountStatus === 'expired';
                          const hasExpiry = !!user.credentialExpiresAt;
                          let daysLeft = null;
                          if (hasExpiry) {
                            const diff = new Date(user.credentialExpiresAt).getTime() - Date.now();
                            daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000));
                          }
                          const isWarning = daysLeft !== null && daysLeft <= 14 && daysLeft > 0;

                          let statusBadge = 'badge--not-started';
                          if (user.accountStatus === 'active') statusBadge = 'badge--completed';
                          else if (user.accountStatus === 'locked' || user.accountStatus === 'disabled') statusBadge = 'badge--locked';
                          else if (isExpired) statusBadge = 'badge--locked';

                          return (
                            <tr key={user.id} style={{ opacity: isExpired || user.accountStatus === 'disabled' ? 0.6 : 1 }}>
                              <td>
                                <div style={{ fontWeight: 600, color: '#E8EEF8' }}>{user.name}</div>
                                <div style={{ fontSize: 'var(--text-2xs)', color: '#5E6F85' }}>{user.email}</div>
                              </td>
                              <td>
                                <span className="tag-chip" style={{ fontSize: '10px' }}>{user.role}</span>
                              </td>
                              <td>
                                <span className={`badge ${statusBadge}`}>
                                  {user.accountStatus.replace('_', ' ')}
                                </span>
                              </td>
                              <td>
                                <span className="num" style={{ textTransform: 'capitalize' }}>{user.validityPeriod || '—'}</span>
                              </td>
                              <td>
                                {hasExpiry ? (
                                  <div>
                                    <div className="num" style={{ fontSize: 'var(--text-xs)', color: isExpired ? 'var(--rose-400)' : isWarning ? 'var(--amber-400)' : '#E8EEF8' }}>
                                      {new Date(user.credentialExpiresAt).toLocaleDateString('en-IN')}
                                    </div>
                                    <div className="num" style={{ fontSize: '9px', color: isExpired ? 'var(--rose-400)' : isWarning ? 'var(--amber-400)' : '#5E6F85' }}>
                                      {isExpired ? 'Lapsed' : `${daysLeft} days left`}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color: '#5E6F85', fontSize: 'var(--text-xs)' }}>Awaiting Activation</span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                  {user.activationToken && (
                                    <button className="btn btn--outline btn--xs" onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/activate/${user.activationToken}`);
                                      alert('Activation link copied!');
                                    }}>Link</button>
                                  )}
                                  <button className="btn btn--outline btn--xs" style={{ color: 'var(--amber-400)' }} onClick={() => handleForceReset(user.id)}>Force Reset</button>
                                  
                                  {user.accountStatus === 'locked' ? (
                                    <button className="btn btn--outline btn--xs" style={{ color: 'var(--emerald-400)' }} onClick={() => handleToggleStatus(user.id, 'unlock')}>Unlock</button>
                                  ) : user.accountStatus === 'disabled' ? (
                                    <button className="btn btn--outline btn--xs" style={{ color: 'var(--emerald-400)' }} onClick={() => handleToggleStatus(user.id, 'enable')}>Enable</button>
                                  ) : (
                                    <button className="btn btn--outline btn--xs" style={{ color: 'var(--rose-400)' }} onClick={() => handleToggleStatus(user.id, 'disable')}>Disable</button>
                                  )}

                                  <button className="btn btn--brass btn--xs" onClick={() => {
                                    setRenewUserId(user.id);
                                    setRenewPeriod(user.validityPeriod || 'monthly');
                                  }}>Renew</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Lesson Resources Manager */}
                <section className="card p-6" style={{ background: '#08101E', borderColor: 'rgba(255,255,255,0.06)', marginTop: 'var(--sp-8)' }}>
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#E8EEF8', marginBottom: '2px', fontFamily: 'var(--font-sans)' }}>
                    Lesson Resources Manager
                  </h2>
                  <p style={{ fontSize: 'var(--text-xs)', color: '#9AAABF', marginBottom: 'var(--sp-5)' }}>
                    Assign custom YouTube videos and PDF study/revision guides dynamically to any of the 44 decoupled syllabus lessons.
                  </p>

                  <form onSubmit={handleLessonUpdateSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-4)', alignItems: 'end' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="manageLessonId" style={{ color: '#9AAABF' }}>Select Lesson *</label>
                      <select 
                        id="manageLessonId" 
                        value={selectedLessonId} 
                        onChange={e => setSelectedLessonId(e.target.value)} 
                        className="form-input" 
                        style={{ appearance: 'auto', background: '#0C1628', padding: '10px' }}
                      >
                        <option value="">-- Choose a Lesson --</option>
                        {Array.from({ length: 44 }, (_, i) => `L${i + 1}`).map(lid => {
                          const lesson = LESSONS.find(l => l.id === lid);
                          return (
                            <option key={lid} value={lid}>
                              Lesson {lid.substring(1)}: {lesson ? lesson.title.substring(0, 24) + '...' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="manageYoutubeId" style={{ color: '#9AAABF' }}>YouTube Video ID</label>
                      <input 
                        id="manageYoutubeId" 
                        type="text" 
                        value={selectedYoutubeId} 
                        onChange={e => setSelectedYoutubeId(e.target.value)} 
                        className="form-input" 
                        placeholder="e.g. y8n21Fv_8h8" 
                        style={{ padding: '10px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="managePdfPath" style={{ color: '#9AAABF' }}>PDF Path / URL</label>
                      <input 
                        id="managePdfPath" 
                        type="text" 
                        value={selectedPdfPath} 
                        onChange={e => setSelectedPdfPath(e.target.value)} 
                        className="form-input" 
                        placeholder="e.g. /lessons/L1.pdf" 
                        style={{ padding: '10px' }}
                      />
                    </div>
                    
                    <button type="submit" className="btn btn--brass" style={{ gridColumn: 'span 3', marginTop: 'var(--sp-2)' }}>
                      Save Lesson Resources ✓
                    </button>
                  </form>
                </section>
              </div>

              {/* Right Column: Audit Logs & Renew Modal */}
              <aside className="dashboard-sidebar" style={{ gap: 'var(--sp-6)' }} aria-label="Audit Logs">
                
                {/* Audit trail logging */}
                <section className="card p-6" style={{ background: '#08101E', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#E8EEF8', marginBottom: 'var(--sp-5)', fontFamily: 'var(--font-sans)' }}>
                    Compliance Audit Log
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', maxHeight: 520, overflowY: 'auto' }}>
                    {auditLogs.map(log => {
                      const meta = log.metadata ? JSON.parse(log.metadata) : null;
                      return (
                        <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '10px', color: 'var(--brass-400)', fontWeight: 600 }}>{log.action}</span>
                            <span className="num" style={{ fontSize: '8px', color: '#5E6F85' }}>{new Date(log.timestamp).toLocaleTimeString('en-IN')}</span>
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: '#E8EEF8', marginTop: '2px', lineHeight: 1.4 }}>
                            Admin <code style={{ color: '#9AAABF' }}>{log.adminId.substring(0,8)}</code> updated target <code style={{ color: '#9AAABF' }}>{(log.targetUserId || '').substring(0,8)}</code>
                          </div>
                          {meta && (
                            <div style={{ background: '#050810', padding: '6px', borderRadius: 4, marginTop: '6px', fontSize: '9px', color: '#9AAABF', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                              {JSON.stringify(meta, null, 2)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Renewal Dialog Modal */}
      {renewUserId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} role="dialog">
          <div className="card p-6" style={{ background: '#08101E', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', color: '#E8EEF8', marginBottom: 'var(--sp-4)' }}>Renew Access Period</h3>
            <form onSubmit={handleRenewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-period" style={{ color: '#9AAABF' }}>Choose Term Duration</label>
                <select 
                  id="new-period" 
                  className="form-input" 
                  value={renewPeriod} 
                  onChange={e => setRenewPeriod(e.target.value as any)} 
                  style={{ appearance: 'auto', background: '#0C1628' }}
                >
                  <option value="monthly">Monthly (+1 Month)</option>
                  <option value="quarterly">Quarterly (+3 Months)</option>
                  <option value="half_yearly">Half-Yearly (+6 Months)</option>
                  <option value="annual">Annual (+12 Months)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'var(--sp-2)' }}>
                <button type="button" className="btn btn--outline flex-1" onClick={() => setRenewUserId(null)}>Cancel</button>
                <button type="submit" className="btn btn--brass flex-1">Apply Renewal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
