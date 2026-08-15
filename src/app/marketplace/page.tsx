'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { SEEKERS, JOB_POSTINGS } from '@/lib/data';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const TIER_BADGE: Record<string, string> = {
  Distinction: 'badge--distinction',
  Proficiency: 'badge--proficiency',
  Completion: 'badge--completion',
};

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState<'talent' | 'jobs'>('talent');
  const [talentSearch, setTalentSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');

  const filteredSeekers = useMemo(() => SEEKERS.filter(s =>
    !talentSearch ||
    s.name.toLowerCase().includes(talentSearch.toLowerCase()) ||
    s.bio.toLowerCase().includes(talentSearch.toLowerCase()) ||
    s.skills.some(sk => sk.toLowerCase().includes(talentSearch.toLowerCase())) ||
    s.capstoneTitle.toLowerCase().includes(talentSearch.toLowerCase())
  ), [talentSearch]);

  const filteredJobs = useMemo(() => JOB_POSTINGS.filter(j =>
    !jobSearch ||
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.description.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.skills.some(sk => sk.toLowerCase().includes(jobSearch.toLowerCase()))
  ), [jobSearch]);

  return (
    <div className="platform">
      <PlatformNav />
      <div className="page-wrapper">
        <main className="page-main" style={{ padding: 'var(--sp-10) 0 var(--sp-16)' }}>
          <div className="container">

            <div className="animate-fadeUp" style={{ marginBottom: 'var(--sp-8)' }}>
              <div className="page-hero__label">Connect & Hire</div>
              <h1 className="page-hero__title">Talent Marketplace</h1>
              <p className="page-hero__subtitle">
                Discover verified FingenIQ graduates, review capstone research, and browse industry finance postings that require FingenIQ credentials.
              </p>
            </div>

            {/* Tabs */}
            <div className="tabs animate-fadeUp" role="tablist" aria-label="Marketplace sections">
              <button
                role="tab"
                className={`tab${activeTab === 'talent' ? ' active' : ''}`}
                onClick={() => setActiveTab('talent')}
                aria-selected={activeTab === 'talent'}
                aria-controls="talent-panel"
              >
                Browse Talent ({SEEKERS.length})
              </button>
              <button
                role="tab"
                className={`tab${activeTab === 'jobs' ? ' active' : ''}`}
                onClick={() => setActiveTab('jobs')}
                aria-selected={activeTab === 'jobs'}
                aria-controls="jobs-panel"
              >
                Job Board ({JOB_POSTINGS.length})
              </button>
            </div>

            {/* Talent Panel */}
            {activeTab === 'talent' && (
              <div id="talent-panel" role="tabpanel" aria-label="Talent directory" className="animate-fadeUp">
                <div className="form-input-wrap" style={{ marginBottom: 'var(--sp-6)' }}>
                  <span className="form-input-icon" aria-hidden="true">🔍</span>
                  <input
                    type="search"
                    className="form-input"
                    placeholder="Search by name, skill, capstone topic..."
                    value={talentSearch}
                    onChange={e => setTalentSearch(e.target.value)}
                    aria-label="Search talent"
                  />
                </div>

                {filteredSeekers.length === 0 ? (
                  <div className="card"><div className="empty-state"><div className="empty-state__icon" aria-hidden="true">👤</div><div className="empty-state__title">No matching candidates</div><p className="empty-state__desc">Try a different name or skill keyword.</p></div></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--sp-5)' }}>
                    {filteredSeekers.map(s => (
                      <article key={s.id} className="card p-6 card--interactive" aria-label={`${s.name}, ${s.credentialTier} tier`}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--navy-800)', border: 'var(--border-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-200)', flexShrink: 0 }}>
                            {s.initials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-50)', marginBottom: 'var(--sp-1)' }}>{s.name}</h3>
                            <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span className={`badge ${TIER_BADGE[s.credentialTier] ?? 'badge--not-started'}`}>{s.credentialTier}</span>
                              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>{s.location} · {s.graduationYear}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div className="num" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--brass-400)' }}>{s.overallScore}%</div>
                            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>Score</div>
                          </div>
                        </div>

                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-4)' }}>{s.bio}</p>

                        {/* Capstone */}
                        <div style={{ padding: 'var(--sp-3) var(--sp-4)', background: 'rgba(255,255,255,0.02)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-4)' }}>
                          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', marginBottom: 'var(--sp-1)' }}>Track {s.capstoneTrack} Capstone</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)' }}>{s.capstoneTitle}</div>
                        </div>

                        {/* Skills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                          {s.skills.slice(0, 4).map(sk => <span key={sk} className="tag-chip">{sk}</span>)}
                          {s.skills.length > 4 && <span className="tag-chip" style={{ color: 'var(--ink-600)' }}>+{s.skills.length - 4}</span>}
                        </div>

                        {/* Tracks */}
                        {s.professionalTracks.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                            {s.professionalTracks.map(t => <span key={t} className="tag-chip tag-chip--brass">{t.replace(' Certification', '')}</span>)}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Jobs Panel */}
            {activeTab === 'jobs' && (
              <div id="jobs-panel" role="tabpanel" aria-label="Job board" className="animate-fadeIn">
                <div className="form-input-wrap" style={{ marginBottom: 'var(--sp-6)' }}>
                  <span className="form-input-icon" aria-hidden="true">🔍</span>
                  <input
                    type="search"
                    className="form-input"
                    placeholder="Search by role, company, skills..."
                    value={jobSearch}
                    onChange={e => setJobSearch(e.target.value)}
                    aria-label="Search jobs"
                  />
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="card"><div className="empty-state"><div className="empty-state__icon" aria-hidden="true">📋</div><div className="empty-state__title">No matching roles</div><p className="empty-state__desc">Try a different title or company name.</p></div></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    {filteredJobs.map(j => (
                      <article key={j.id} className="card p-6 card--interactive" aria-label={`${j.title} at ${j.company}`}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-6)', marginBottom: 'var(--sp-4)' }}>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-50)', marginBottom: 'var(--sp-2)' }}>{j.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', fontWeight: 500 }}>{j.company}</span>
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>📍 {j.location}</span>
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>⏳ {j.type}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--emerald-400)' }}>{j.salary}</div>
                            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', marginTop: 2 }}>Posted {j.posted}</div>
                          </div>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-4)' }}>{j.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', alignItems: 'center' }}>
                          <span className={`badge ${TIER_BADGE[j.requiredTier] ?? 'badge--not-started'}`}>Requires {j.requiredTier}</span>
                          {j.requiredTrack && <span className="tag-chip tag-chip--brass">{j.requiredTrack.replace(' Certification', '')}</span>}
                          {j.skills.slice(0, 3).map(sk => <span key={sk} className="tag-chip">{sk}</span>)}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
