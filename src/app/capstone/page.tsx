'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { LESSONS } from '@/lib/data';
import { useState, useMemo } from 'react';

export default function CapstoneWorkspace() {
  const [track, setTrack] = useState<'A' | 'B'>('A');
  const [citationSearch, setCitationSearch] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [inputs, setInputs] = useState({ wacc: 10, growth: 4, freeCashFlow: 50000000, shares: 10000000 });

  const dcf = useMemo(() => {
    const r = inputs.wacc / 100;
    const g = inputs.growth / 100;
    if (r <= g) return { ev: 0, iv: 0, tvMultiple: 0 };
    const ev = (inputs.freeCashFlow * (1 + g)) / (r - g);
    const iv = ev / inputs.shares;
    return { ev: Math.round(ev), iv: parseFloat(iv.toFixed(2)), tvMultiple: parseFloat((ev / inputs.freeCashFlow).toFixed(1)) };
  }, [inputs]);

  const filteredCitations = useMemo(() => {
    if (!citationSearch.trim()) return [];
    return LESSONS.filter(l =>
      l.title.toLowerCase().includes(citationSearch.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(citationSearch.toLowerCase()))
    ).slice(0, 6);
  }, [citationSearch]);

  const addCitation = (title: string) => {
    if (!citations.includes(title)) setCitations(p => [...p, title]);
    setCitationSearch('');
  };

  const formatCrore = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  return (
    <div className="platform">
      <PlatformNav />
      <div className="page-wrapper">
        <main className="page-main" style={{ padding: 'var(--sp-10) 0 var(--sp-16)' }}>
          <div className="container">

            <div className="animate-fadeUp" style={{ marginBottom: 'var(--sp-10)' }}>
              <div className="page-hero__label">Academic Milestone</div>
              <h1 className="page-hero__title">Capstone Workspace</h1>
              <p className="page-hero__subtitle">
                Complete a comprehensive financial planning thesis or investment valuation model. This is a graded submission that contributes 10% of your weighted score toward certification.
              </p>
            </div>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 360px' }}>
              <div className="dashboard-main animate-fadeUp">

                {/* Track Selector */}
                <section className="card p-7" aria-labelledby="track-heading">
                  <h2 id="track-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Select Research Pathway
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)' }}>
                    {([
                      {
                        id: 'A' as const,
                        label: 'Track A — Personal Wealth Plan',
                        icon: '💼',
                        desc: 'Develop a comprehensive 5-year personal financial plan covering cash flow optimisation, emergency corpus, insurance structuring, debt elimination, investment asset allocation, and retirement modelling.',
                        tags: ['Personal Finance', 'Budgeting', 'Insurance', 'Retirement'],
                      },
                      {
                        id: 'B' as const,
                        label: 'Track B — Investment Thesis Analysis',
                        icon: '📊',
                        desc: 'Select a listed Indian company and produce a formal investment research report including DCF valuation, financial statement analysis, industry positioning, risk factors, and a buy/hold/sell recommendation.',
                        tags: ['Corporate Finance', 'Equity Research', 'DCF', 'SEBI'],
                      },
                    ]).map(t => (
                      <button
                        key={t.id}
                        className={`card card--interactive p-6 ${track === t.id ? 'card--credential' : ''}`}
                        onClick={() => setTrack(t.id)}
                        style={{
                          border: track === t.id ? '2px solid var(--brass-500)' : '',
                          textAlign: 'left',
                          cursor: 'pointer',
                          background: track === t.id ? 'rgba(184,150,46,0.07)' : '',
                        }}
                        aria-pressed={track === t.id}
                        aria-label={`Select ${t.label}`}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-4)' }} aria-hidden="true">{t.icon}</div>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 700, color: track === t.id ? 'var(--brass-300)' : 'var(--ink-100)', marginBottom: 'var(--sp-3)', lineHeight: 'var(--leading-snug)' }}>
                          {t.label}
                        </h3>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-4)' }}>
                          {t.desc}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                          {t.tags.map(tg => <span key={tg} className="tag-chip tag-chip--brass">{tg}</span>)}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* DCF Model Calculator (Track B) */}
                {track === 'B' && (
                  <section className="card p-7" aria-labelledby="dcf-heading">
                    <h2 id="dcf-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)', fontFamily: 'var(--font-sans)' }}>
                      DCF Valuation Model
                    </h2>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--sp-6)' }}>
                      Gordon Growth Model — Terminal Value approach. Adjust WACC and perpetual growth to calibrate your intrinsic value estimate.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                      {[
                        { id: 'wacc', label: 'WACC (%)', key: 'wacc' as const, min: 1, max: 30, step: 0.5 },
                        { id: 'growth', label: 'Perpetual Growth Rate (%)', key: 'growth' as const, min: 0, max: 10, step: 0.5 },
                        { id: 'fcf', label: 'Free Cash Flow (₹)', key: 'freeCashFlow' as const, min: 0, max: undefined, step: 1000000 },
                        { id: 'shares', label: 'Shares Outstanding', key: 'shares' as const, min: 1, max: undefined, step: 100000 },
                      ].map(f => (
                        <div className="form-group" key={f.id}>
                          <label className="form-label" htmlFor={f.id}>{f.label}</label>
                          <input
                            type="number"
                            id={f.id}
                            className="form-input"
                            value={inputs[f.key]}
                            min={f.min}
                            max={f.max}
                            step={f.step}
                            onChange={e => setInputs(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      ))}
                    </div>

                    {inputs.wacc > inputs.growth ? (
                      <div className="card card--credential p-6">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-5)' }}>
                          <div>
                            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enterprise Value</div>
                            <div className="num" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--brass-400)' }}>{formatCrore(dcf.ev)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Intrinsic Value / Share</div>
                            <div className="num" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--emerald-400)' }}>₹{dcf.iv.toFixed(2)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TV Multiple (FCF)</div>
                            <div className="num" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sapphire-400)' }}>{dcf.tvMultiple}×</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="error-state" role="alert">
                        <div className="error-state__icon" aria-hidden="true">⚠️</div>
                        <div className="error-state__title">Invalid Parameters</div>
                        <p className="error-state__desc">WACC must be greater than perpetual growth rate (r &gt; g) for the Gordon Growth Model to produce a valid terminal value.</p>
                      </div>
                    )}
                  </section>
                )}

                {/* Submission Panel */}
                <section className="card p-7" aria-labelledby="submission-heading">
                  <h2 id="submission-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Submit Capstone Project
                  </h2>
                  <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
                    <label className="form-label" htmlFor="capstone-title">Project Title</label>
                    <input type="text" id="capstone-title" className="form-input" placeholder={track === 'A' ? 'e.g. 5-Year Wealth Architecture Plan — Arjun Mehta' : 'e.g. Reliance Industries — DCF Valuation & Buy Thesis'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
                    <label className="form-label" htmlFor="executive-summary">Executive Summary</label>
                    <textarea id="executive-summary" className="form-input" rows={5} placeholder="Summarise your methodology, key findings, and recommendations..." style={{ resize: 'vertical' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
                    <label className="form-label" htmlFor="upload">Upload Report (PDF)</label>
                    <input type="file" id="upload" className="form-input" accept=".pdf" aria-describedby="upload-hint" />
                    <span id="upload-hint" style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>PDF only · Max 10MB · Include citations to FingenIQ lessons</span>
                  </div>
                  <button className="btn btn--brass btn--lg btn--wide" onClick={() => alert('Capstone submitted for review. You will receive feedback within 5 business days.')}>
                    Submit for Review →
                  </button>
                </section>
              </div>

              {/* Citation Manager Sidebar */}
              <aside className="dashboard-sidebar animate-fadeUp delay-100" aria-label="Citation manager">
                <div className="card p-6">
                  <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-5)', fontFamily: 'var(--font-sans)' }}>
                    Citation Manager
                  </h2>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-5)' }}>
                    Link your thesis claims back to specific FingenIQ lessons. Citations strengthen the academic integrity of your submission.
                  </p>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                    <label className="form-label" htmlFor="citation-search">Search Lessons</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon" aria-hidden="true">🔍</span>
                      <input
                        type="search"
                        id="citation-search"
                        className="form-input"
                        placeholder="e.g. WACC, DCF, bonds..."
                        value={citationSearch}
                        onChange={e => setCitationSearch(e.target.value)}
                        aria-label="Search lessons to cite"
                        aria-expanded={filteredCitations.length > 0}
                        aria-autocomplete="list"
                        aria-controls="citation-results"
                      />
                    </div>
                  </div>

                  {filteredCitations.length > 0 && (
                    <ul id="citation-results" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)', maxHeight: 200, overflowY: 'auto' }} role="listbox" aria-label="Matching lessons">
                      {filteredCitations.map(l => (
                        <li key={l.id}>
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 'var(--text-xs)', textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}
                            onClick={() => addCitation(l.title)}
                            aria-label={`Add citation: Lesson ${l.order} — ${l.title}`}
                          >
                            <span className="num" style={{ color: 'var(--brass-500)', marginRight: 'var(--sp-2)' }}>L{String(l.order).padStart(2, '0')}</span>
                            {l.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {citations.length === 0 ? (
                    <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                      <div className="empty-state__icon" aria-hidden="true">📎</div>
                      <div className="empty-state__title">No citations yet</div>
                      <p className="empty-state__desc">Search and add lessons to build your citation list.</p>
                    </div>
                  ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }} aria-label="Added citations">
                      {citations.map((c, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', background: 'rgba(184,150,46,0.06)', border: 'var(--border-brass)', borderRadius: 'var(--radius-lg)' }}>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-200)', lineHeight: 'var(--leading-snug)' }}>{c}</span>
                          <button
                            className="btn btn--ghost btn--xs"
                            onClick={() => setCitations(p => p.filter(x => x !== c))}
                            aria-label={`Remove citation: ${c}`}
                            style={{ color: 'var(--rose-400)', flexShrink: 0 }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {citations.length > 0 && (
                    <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span className="num" style={{ fontSize: 'var(--text-xs)', color: 'var(--emerald-400)' }}>{citations.length} citation{citations.length !== 1 ? 's' : ''} added</span>
                    </div>
                  )}
                </div>

                {/* Grading Rubric */}
                <div className="card p-6">
                  <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-5)', fontFamily: 'var(--font-sans)' }}>
                    Grading Rubric
                  </h2>
                  <table className="data-table" aria-label="Capstone grading rubric">
                    <thead>
                      <tr>
                        <th scope="col">Criterion</th>
                        <th scope="col" style={{ textAlign: 'right' }}>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Methodology & Rigour', '30%'],
                        ['Financial Analysis Depth', '30%'],
                        ['Lesson Citation Quality', '20%'],
                        ['Presentation & Clarity', '20%'],
                      ].map(([crit, w]) => (
                        <tr key={crit}>
                          <td>{crit}</td>
                          <td style={{ textAlign: 'right' }}><span className="num">{w}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </aside>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
