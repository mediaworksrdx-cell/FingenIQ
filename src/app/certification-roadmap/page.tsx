import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { STANDARDS_MILESTONES, EQUIVALENCE_MAP } from '@/lib/data';
import Link from 'next/link';

export const metadata = {
  title: 'Institutional Standards & Curriculum Roadmap',
  description: 'FingenIQ’s structured path toward academic excellence and global syllabus benchmarking.',
};

export default function CertificationRoadmap() {
  return (
    <div className="platform">
      <PlatformNav />

      <div className="page-wrapper">
        <main className="page-main py-8">
          <div className="container">

            {/* Header */}
            <div className="section-header animate-fadeUp">
              <span className="section-label">Standards &amp; Governance</span>
              <h1 className="hero__title" style={{ fontSize: 'var(--text-3xl)', marginTop: '4px' }}>
                Institutional Standards &amp; Curriculum Roadmap
              </h1>
              <p className="section-subtitle" style={{ marginTop: '4px' }}>
                FinGeniQ’s structured roadmap for academic rigor, third-party question audits, and global syllabus benchmarking.
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="card p-6 animate-fadeUp mb-8">
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)' }}>Roadmap Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                {STANDARDS_MILESTONES.map((ms, idx) => {
                  const isAchieved = ms.status === 'achieved';
                  const isActive = ms.status === 'active';
                  const badgeClass = isAchieved ? 'badge--completed' : isActive ? 'badge--in-progress' : 'badge--not-started';

                  return (
                    <div key={ms.id} style={{ display: 'flex', gap: '16px' }}>
                      {/* Step node */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: isAchieved ? 'rgba(16,185,129,0.15)' : isActive ? 'rgba(245,158,11,0.15)' : 'rgba(90,104,130,0.15)',
                          border: isAchieved ? '1px solid var(--emerald-500)' : isActive ? '1px solid var(--amber-500)' : '1px solid var(--ink-700)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600,
                          color: isAchieved ? 'var(--emerald-400)' : isActive ? 'var(--amber-400)' : 'var(--ink-400)'
                        }}>
                          {ms.icon}
                        </div>
                        {idx < STANDARDS_MILESTONES.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: 'var(--ink-800)', marginTop: '8px' }} />
                        )}
                      </div>

                      {/* Content card */}
                      <div className="card p-4" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)' }}>{ms.title}</h4>
                          <span className={`badge ${badgeClass}`}>{ms.status}</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', marginBottom: '8px' }}>{ms.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ink-500)' }}>
                          <span>Target: {ms.targetDate} {ms.achievedDate && `(Achieved: ${ms.achievedDate})`}</span>
                          <span>Owner: {ms.owner}</span>
                        </div>
                        {ms.notes && (
                          <div style={{ fontSize: '10px', color: 'var(--brass-400)', fontStyle: 'italic', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px' }}>
                            Note: {ms.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equivalence map table */}
            <div className="card p-6 animate-fadeUp">
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-4)' }}>Equivalence Reference Map</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: '16px', lineHeight: 'var(--leading-relaxed)' }}>
                The following matrix maps FingenIQ modules against traditional Indian and international professional certifications for syllabus alignment reference only. This represents syllabus overlap analysis, NOT regulatory parity.
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>FingenIQ Module</th>
                    <th>CA/CMA Overlap</th>
                    <th>CFA L1 Overlap</th>
                    <th>BPF Overlap</th>
                  </tr>
                </thead>
                <tbody>
                  {EQUIVALENCE_MAP.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.fingeniQ}</td>
                      <td>{row.ca_icwa}</td>
                      <td>{row.cfa}</td>
                      <td>{row.bpf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: '10px', color: 'var(--ink-500)', marginTop: '12px', fontStyle: 'italic' }}>
                * Source: Internal FingenIQ syllabus benchmarking study. CA refers to ICAI CA curriculum syllabus. CFA refers to CFA Institute candidate body of knowledge (CBOK).
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
