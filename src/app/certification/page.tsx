'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { CERTIFICATION_CONFIG, PROFESSIONAL_TRACKS } from '@/lib/data';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUserProgress, issueCertificate } from '@/app/actions/progressActions';

const TIER_STYLES: Record<string, { card: string; badge: string; glow: string; label: string; color: string; border: string }> = {
  Distinction: {
    card:  'card--tier-distinction',
    badge: 'badge--distinction',
    glow:  'rgba(184,150,46,0.30)',
    label: 'Distinction',
    color: 'var(--brass-400)',
    border: 'rgba(184,150,46,0.40)',
  },
  Proficiency: {
    card:  'card--tier-proficiency',
    badge: 'badge--proficiency',
    glow:  'rgba(192,200,216,0.18)',
    label: 'Proficiency',
    color: 'var(--silver-400)',
    border: 'rgba(192,200,216,0.30)',
  },
  Completion: {
    card:  'card--tier-completion',
    badge: 'badge--completion',
    glow:  'rgba(173,124,72,0.18)',
    label: 'Completion',
    color: 'var(--bronze-400)',
    border: 'rgba(173,124,72,0.30)',
  },
};

export default function Certification() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [certification, setCertification] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [issuing, setIssuing] = useState<string | null>(null);
  const [certSettings, setCertSettings] = useState<any>({
    distinctionMinScore: 85,
    proficiencyMinScore: 75,
    completionMinScore: 60,
  });
  const [dynProfTracks, setDynProfTracks] = useState<any[]>(PROFESSIONAL_TRACKS);

  const loadData = () => {
    fetchUserProgress().then(res => {
      if (res.success) {
        setProgress(res.aggregate);
        setCertification(res.certification);
        setCertificates(res.certificates || []);
      }
      setLoading(false);
    });

    fetch('/api/governance/data')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          if (d.certificationSettings) setCertSettings(d.certificationSettings);
          if (d.professionalTracks && d.professionalTracks.length > 0) {
            const mapped = d.professionalTracks.map((pt: any) => ({
              id: pt.id,
              name: pt.name,
              icon: pt.icon || '📜',
              description: pt.description,
              requiredModules: typeof pt.requiredModules === 'string' ? JSON.parse(pt.requiredModules) : (pt.requiredModules || []),
              requiredLessons: typeof pt.requiredLessons === 'string' ? JSON.parse(pt.requiredLessons) : (pt.requiredLessons || []),
            }));
            setDynProfTracks(mapped);
          }
        }
      })
      .catch(e => console.error('Failed to load governance cert settings:', e));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (trackId: string) => {
    setIssuing(trackId);
    try {
      const res = await issueCertificate(trackId);
      if (res.success) {
        alert(`Certificate successfully generated! Hash: ${res.certificateHash}`);
        loadData();
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIssuing(null);
    }
  };

  if (loading) {
    return (
      <div className="platform surface--dark">
        <PlatformNav />
        <div className="container" style={{ padding: 'var(--sp-20) 0', color: 'var(--ink-400)' }}>
          Loading Credentials data...
        </div>
      </div>
    );
  }

  const weightedScore = certification?.weightedScore ?? 0;
  const CIRC = 414.7;
  const strokeOffset = CIRC * (1 - Math.min(1, weightedScore / 100));

  const REQUIREMENTS = [
    { label: 'Weighted Score ≥ 75%',      met: weightedScore >= 75 },
    { label: 'Capstone Project completed', met: progress?.lessonsCompleted >= 35 },
    { label: 'All 44 Lesson Quizzes attempted', met: progress?.lessonsCompleted >= 44 },
    { label: 'Completed at least 15 lessons', met: progress?.lessonsCompleted >= 15 },
  ];

  return (
    <div className="platform surface--dark">
      <PlatformNav />

      <div className="page-wrapper">
        <main className="page-main" style={{ padding: 'var(--sp-10) 0 var(--sp-16)' }}>
          <div className="container">

            {/* Page Header */}
            <div className="animate-fadeUp" style={{ marginBottom: 'var(--sp-10)' }}>
              <div className="page-hero__label">Credentials</div>
              <h1 className="page-hero__title">Certification Center</h1>
              <p className="page-hero__subtitle">
                Track your credential tier, professional certifications, and regulatory equivalence mapping.
                Verified credentials are publicly accessible via unique verification URLs.
              </p>
            </div>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '320px 1fr' }}>

              {/* Left Sidebar */}
              <aside className="dashboard-sidebar animate-fadeUp" aria-label="Certification status">

                {/* Score Ring */}
                <div className="card p-7" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: 'var(--sp-5)' }}>
                    Weighted Score
                  </div>
                  <div
                    className="progress-ring"
                    role="img"
                    aria-label={`${weightedScore.toFixed(1)}% weighted score`}
                    style={{ marginBottom: 'var(--sp-5)' }}
                  >
                    <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
                      <defs>
                        <linearGradient id="tierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--brass-600)" />
                          <stop offset="100%" stopColor="var(--brass-400)" />
                        </linearGradient>
                      </defs>
                      <circle cx="90" cy="90" r="66" className="progress-ring__track" strokeWidth="12" />
                      <circle
                        cx="90" cy="90" r="66"
                        fill="none"
                        stroke="url(#tierGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={CIRC}
                        strokeDashoffset={strokeOffset}
                        filter="drop-shadow(0 0 8px rgba(184,150,46,0.35))"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0,0,0.2,1)' }}
                      />
                    </svg>
                    <div className="progress-ring__label">
                      <span className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--ink-50)', display: 'block' }}>
                        {weightedScore > 0 ? `${weightedScore.toFixed(1)}%` : '—'}
                      </span>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Current Score
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${certification?.tier ? 'badge--completed' : 'badge--not-started'}`} style={{ fontSize: 'var(--text-xs)', padding: '5px 14px' }}>
                    {certification?.tier ?? 'Not Yet Eligible'}
                  </span>
                  {weightedScore < 75 && (
                    <div style={{ marginTop: 'var(--sp-5)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 'var(--leading-relaxed)' }}>
                      Need <span className="num" style={{ color: 'var(--amber-400)' }}>{(75 - weightedScore).toFixed(1)}%</span> more for Completion tier
                    </div>
                  )}
                </div>

                {/* Requirements Checklist */}
                <div className="card p-6" aria-labelledby="req-heading">
                  <h2 id="req-heading" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-5)', fontFamily: 'var(--font-sans)' }}>
                    Requirements Checklist
                  </h2>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }} role="list">
                    {REQUIREMENTS.map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-xs)' }}>
                        <span
                          style={{ color: r.met ? 'var(--emerald-400)' : 'var(--rose-400)', flexShrink: 0, marginTop: 2 }}
                          aria-hidden="true"
                        >
                          {r.met ? '✓' : '✕'}
                        </span>
                        <span style={{ color: r.met ? 'var(--ink-200)' : 'var(--ink-500)' }}>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Alert */}
                <div className="card p-5" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }} role="alert">
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--amber-300)', lineHeight: 'var(--leading-relaxed)' }}>
                    Complete lessons and quizzes to increase your score and unlock certifications. Your progress is dynamically backed up.
                  </div>
                  <Link href="/lessons" className="btn btn--outline btn--sm w-full" style={{ marginTop: 'var(--sp-4)' }}>
                    Go to Lesson Library →
                  </Link>
                </div>
              </aside>

              {/* Right Column */}
              <div className="dashboard-main animate-fadeUp delay-100">

                {/* Tier Cards */}
                <section className="card p-7" aria-labelledby="tiers-heading">
                  <h2 id="tiers-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Credential Tiers
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    {[
                      { name: 'Distinction', minScore: certSettings?.distinctionMinScore || 85, emoji: '🏅', requiresCapstoneExcellence: true },
                      { name: 'Proficiency', minScore: certSettings?.proficiencyMinScore || 75, emoji: '🎓', requiresCapstoneExcellence: false },
                      { name: 'Completion', minScore: certSettings?.completionMinScore || 60, emoji: '✅', requiresCapstoneExcellence: false },
                    ].map(tier => {
                      const ts = TIER_STYLES[tier.name];
                      const achieved = weightedScore >= tier.minScore && progress?.lessonsCompleted >= 15;
                      return (
                        <div key={tier.name} className={`card p-6 ${ts.card}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-6)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                            <div
                              style={{ width: 52, height: 52, borderRadius: 'var(--radius-xl)', background: `${ts.glow}`, border: `1px solid ${ts.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', boxShadow: `0 0 24px ${ts.glow}` }}
                              aria-hidden="true"
                            >
                              {tier.emoji}
                            </div>
                            <div>
                              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 700, color: ts.color, marginBottom: 'var(--sp-1)' }}>
                                {tier.name}
                              </h3>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
                                Minimum weighted score: <span className="num" style={{ color: ts.color }}>{tier.minScore}%</span>
                                {tier.requiresCapstoneExcellence && ' · Capstone Excellence required'}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div className="num" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: achieved ? 'var(--emerald-400)' : 'var(--ink-600)' }}>
                                {weightedScore.toFixed(1)}% / {tier.minScore}%
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
                                {achieved ? '✓ Achieved' : `${(tier.minScore - weightedScore).toFixed(1)}% away`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Professional Tracks */}
                <section className="card p-7" aria-labelledby="tracks-heading">
                  <h2 id="tracks-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Professional Track Certifications
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                    {dynProfTracks.map(track => {
                      const hasCert = certificates.some(c => c.trackId === track.id);
                      // Custom eligibility: eligible if all required lessons are completed
                      const trackEligibility = certification?.professionalTracks?.includes(track.name) ? 'eligible' : 'not-eligible';
                      return (
                        <div key={track.id} className="card p-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                              <span style={{ fontSize: '1.35rem' }} aria-hidden="true">{track.icon}</span>
                              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)' }}>{track.name}</h3>
                            </div>
                            <div>
                              {hasCert ? (
                                <span className="badge badge--completed">Issued</span>
                              ) : trackEligibility === 'eligible' ? (
                                <button 
                                  className="btn btn--brass btn--xs"
                                  onClick={() => handleIssue(track.id)}
                                  disabled={issuing === track.id}
                                >
                                  {issuing === track.id ? 'Generating...' : 'Claim Certificate'}
                                </button>
                              ) : (
                                <span className="badge badge--not-started">Locked</span>
                              )}
                            </div>
                          </div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>{track.description}</p>
                          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                            {track.requiredModules.map(m => (
                              <span key={m} className="tag-chip tag-chip--sapphire">{m}</span>
                            ))}
                            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-600)', display: 'flex', alignItems: 'center' }}>
                              · {track.requiredLessons.length} lessons required
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Issued Credentials */}
                <section className="card p-7" aria-labelledby="credential-heading">
                  <h2 id="credential-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)', fontFamily: 'var(--font-sans)' }}>
                    Shareable Verified Credentials
                  </h2>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--sp-6)' }}>
                    Once a professional track certificate is generated, anyone can authenticate its integrity using its unique cryptographic signature.
                  </p>
                  
                  {certificates.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                      {certificates.map(cert => {
                        const trackName = PROFESSIONAL_TRACKS.find(t => t.id === cert.trackId)?.name || cert.trackId;
                        return (
                          <div key={cert.id} className="card p-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(201,168,76,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
                              <div>
                                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brass-400)' }}>{trackName}</h3>
                                <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>Issued on {new Date(cert.issuedAt).toLocaleDateString()}</div>
                              </div>
                              <Link href={`/certification/verify/${cert.certificateHash}`} className="btn btn--outline btn--xs">
                                Verification Link
                              </Link>
                            </div>
                            <div style={{ fontSize: 'var(--text-2xs)', fontFamily: 'monospace', color: 'var(--ink-400)', marginTop: 'var(--sp-2)' }}>
                              Hash: {cert.certificateHash}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="card p-10"
                      style={{ background: 'rgba(255,255,255,0.01)', textAlign: 'center', position: 'relative', minHeight: 180 }}
                      role="img"
                      aria-label="Credential preview — locked until requirements are met"
                    >
                      <div className="locked-overlay">
                        <div className="locked-overlay__icon" aria-hidden="true">🔒</div>
                        <div className="locked-overlay__text">
                          Claim your certificates above to display verify links here.
                        </div>
                      </div>
                      <div style={{ opacity: 0.12, fontSize: '3rem' }} aria-hidden="true">🎓</div>
                    </div>
                  )}
                  <div style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    Verification Page:{' '}
                    <code style={{ fontSize: 'var(--text-xs)' }}>/certification/verify/[code]</code>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
