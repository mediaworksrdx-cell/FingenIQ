'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { useState, useMemo, useEffect } from 'react';

const TIER_BADGE: Record<string, string> = {
  Distinction: 'badge--distinction',
  Proficiency: 'badge--proficiency',
  Completion: 'badge--completion',
};

export default function Marketplace() {
  const [jobSearch, setJobSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/marketplace/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => jobs.filter(j => {
    const matchesSearch = !jobSearch ||
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.description.toLowerCase().includes(jobSearch.toLowerCase()) ||
      (Array.isArray(j.skills) ? j.skills : []).some((sk: string) => sk.toLowerCase().includes(jobSearch.toLowerCase()));
    const matchesTier = tierFilter === 'all' || j.requiredTier === tierFilter;
    return matchesSearch && matchesTier;
  }), [jobs, jobSearch, tierFilter]);

  return (
    <div className="platform">
      <PlatformNav />
      <div className="page-wrapper">
        <main className="page-main" style={{ padding: 'var(--sp-10) 0 var(--sp-16)' }}>
          <div className="container">

            <div className="animate-fadeUp" style={{ marginBottom: 'var(--sp-8)' }}>
              <div className="page-hero__label">Opportunities &amp; Careers</div>
              <h1 className="page-hero__title">Marketplace</h1>
              <p className="page-hero__subtitle">
                Explore curated finance roles, research positions, and institutional postings that require FingenIQ credentials.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="animate-fadeUp" style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', marginBottom: 'var(--sp-8)' }}>
              <div className="form-input-wrap" style={{ flex: 1, minWidth: '260px' }}>
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
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '180px' }}
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                aria-label="Filter by credential tier"
              >
                <option value="all">All Credential Tiers</option>
                <option value="Distinction">Requires Distinction</option>
                <option value="Proficiency">Requires Proficiency</option>
                <option value="Completion">Requires Completion</option>
              </select>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="card p-12 text-center" style={{ color: 'var(--ink-400)' }}>
                Loading marketplace opportunities...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="card animate-fadeUp" style={{ padding: 'var(--sp-16) var(--sp-6)', textAlign: 'center', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.85rem', margin: '0 auto var(--sp-5)' }}>
                  💼
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>
                  {jobSearch || tierFilter !== 'all' ? 'No matching listings found' : 'No active listings currently open'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-400)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                  {jobSearch || tierFilter !== 'all' 
                    ? 'Try adjusting your search terms or clearing tier filters.'
                    : 'Check back soon as institutional partners and financial firms publish new analyst and associate opportunities.'}
                </p>
              </div>
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
                      {(Array.isArray(j.skills) ? j.skills : []).slice(0, 4).map((sk: string) => <span key={sk} className="tag-chip">{sk}</span>)}
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
