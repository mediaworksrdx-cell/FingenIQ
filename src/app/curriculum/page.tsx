import { Metadata } from 'next';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import { MODULES } from '@/lib/data';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Curriculum | FingenIQ',
  description: 'A comprehensive curriculum spanning 44 lessons across 8 modules, covering everything from financial fundamentals to institutional finance and leadership.',
};

export default function CurriculumPage() {
  return (
    <div className="landing">
      <PublicNav />

      <div className="page-wrapper">
        <main className="page-main">

          {/* Hero Section */}
          <section className="hero" id="hero" style={{ minHeight: '50vh' }}>
            <div className="hero__bg"></div>
            <div className="hero__grid"></div>
            <div className="container relative">
              <div className="hero__content animate-fadeUp" style={{ maxWidth: '760px' }}>
                <div className="hero__eyebrow">📚 Curriculum</div>
                <h1 className="hero__title">Structured Financial Education</h1>
                <p className="hero__subtitle" style={{ marginBottom: 'var(--sp-5)' }}>
                  A comprehensive curriculum spanning 44 lessons across 8 modules, covering everything from financial fundamentals to institutional finance and leadership.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <div style={{ background: '#FAF8F5', borderTop: 'var(--border-subtle)', borderBottom: 'var(--border-subtle)', padding: 'var(--sp-5) 0' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--sp-6)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--brass-400)' }}>44</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginTop: '2px' }}>Lessons</div>
                </div>
                <div style={{ width: '1px', height: '44px', background: 'rgba(0,0,0,0.08)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--brass-400)' }}>8</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginTop: '2px' }}>Modules</div>
                </div>
                <div style={{ width: '1px', height: '44px', background: 'rgba(0,0,0,0.08)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--brass-400)' }}>3</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginTop: '2px' }}>Credential Tiers</div>
                </div>
                <div style={{ width: '1px', height: '44px', background: 'rgba(0,0,0,0.08)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--brass-400)' }}>20</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginTop: '2px' }}>Steps / Lesson</div>
                </div>
                <div style={{ width: '1px', height: '44px', background: 'rgba(0,0,0,0.08)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--brass-400)' }}>AI</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginTop: '2px' }}>Powered Tutor</div>
                </div>
                <div style={{ width: '1px', height: '44px', background: 'rgba(0,0,0,0.08)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--brass-400)' }}>CFA / CA</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginTop: '2px' }}>Benchmarked Curriculum</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8 Structured Modules */}
          <section className="py-20" id="modules" style={{ background: '#FAF8F5', borderBottom: 'var(--border-subtle)' }}>
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ marginBottom: 'var(--sp-10)' }}>
                <span className="section-label">Curriculum Overview</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-3)' }}>8 Structured Learning Modules</h2>
                <p className="section-subtitle mx-auto" style={{ marginTop: 'var(--sp-4)' }}>
                  44 lessons across 8 modules, each built on a rigorous 20-step framework covering theory, application, case studies, and assessment.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-5)' }}>
                {MODULES.map((m, idx) => (
                  <div key={m.id} className="module-tile animate-fadeUp" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="module-tile__header">
                      <span className="module-tile__badge">Module 0{m.order}</span>
                      <span className="module-tile__pill">{m.lessonIds.length} Lessons</span>
                    </div>
                    <div className="module-tile__icon-box">
                      {m.icon}
                    </div>
                    <h3 className="module-tile__title">{m.title}</h3>
                    <div className="module-tile__footer">
                      <span className="module-tile__cta">Structured Track</span>
                      <span className="module-tile__arrow">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Financial Knowledge Stages */}
          <section className="py-20" id="knowledge-stages">
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ marginBottom: 'var(--sp-10)' }}>
                <span className="section-label">Lifelong Learning</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-3)' }}>Financial Knowledge for Every Stage of Life</h2>
                <p className="section-subtitle mx-auto" style={{ marginTop: 'var(--sp-4)' }}>
                  Financial education is valuable throughout life, helping individuals make informed decisions at every milestone.
                </p>
              </div>

              <div className="stages-grid">
                {[
                  'Managing your first income',
                  'Building healthy saving habits',
                  'Creating and following a budget',
                  'Understanding banking and digital payments',
                  'Using credit responsibly',
                  'Planning major purchases',
                  'Protecting yourself through insurance',
                  'Growing wealth through investing',
                  'Understanding taxes and financial planning',
                  'Preparing for retirement',
                  'Building and managing a business',
                  'Creating long-term financial security'
                ].map((stage, idx) => (
                  <div key={idx} className="stage-tile animate-fadeUp" style={{ animationDelay: `${idx * 35}ms` }}>
                    <span className="stage-tile__num">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="stage-tile__text">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Wealth Management */}
          <section className="py-20" id="wealth-management" style={{ background: '#FAF8F5', borderTop: 'var(--border-subtle)', borderBottom: 'var(--border-subtle)' }}>
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ marginBottom: 'var(--sp-12)' }}>
                <span className="section-label">Structured Wealth Strategy</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-3)' }}>Wealth Management for Every Stage of Life</h2>
                <p className="section-subtitle mx-auto" style={{ marginTop: 'var(--sp-4)' }}>
                  Wealth management is not reserved for high-net-worth individuals. It is a lifelong process of growing, protecting, and transferring wealth responsibly. FingenIQ introduces learners to essential wealth management principles, including:
                </p>
              </div>

              <div className="wealth-grid-4">
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '0ms' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--brass-500)', marginBottom: 'var(--sp-4)' }}>Wealth Creation</div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Income planning</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Saving strategies</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Investment fundamentals</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Business ownership</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Long-term capital growth</li>
                  </ul>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '80ms' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--brass-500)', marginBottom: 'var(--sp-4)' }}>Wealth Growth</div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Portfolio diversification</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Asset allocation</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Equity and fixed-income investing</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Alternative investments</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Risk-adjusted investing</li>
                  </ul>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '160ms' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--brass-500)', marginBottom: 'var(--sp-4)' }}>Wealth Protection</div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Insurance planning</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Risk management</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Tax awareness</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Emergency financial planning</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Asset protection strategies</li>
                  </ul>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '240ms' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--brass-500)', marginBottom: 'var(--sp-4)' }}>Wealth Preservation</div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Retirement planning</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Estate planning fundamentals</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Inflation management</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Sustainable investing</li>
                    <li style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', position: 'relative', paddingLeft: 'var(--sp-3)' }}>Long-term financial resilience</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Gateway CTA */}
          <section className="py-20" id="enter-platform" style={{ background: '#FAF8F5', borderTop: 'var(--border-subtle)', textAlign: 'center' }}>
            <div className="container container--narrow" style={{ position: 'relative', zIndex: 1 }}>
              <div className="animate-fadeUp" style={{ textAlign: 'center' }}>
                <span className="section-label">Ready to Begin?</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-5)', fontSize: 'var(--text-5xl)' }}>
                  Learn Smarter.<br /><em>Manage Wealth. Achieve Financial Freedom.</em>
                </h2>
                <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/login" className="btn btn--brass btn--lg" style={{ fontSize: 'var(--text-base)', padding: 'var(--sp-4) var(--sp-10)' }}>
                    Enter FingenIQ →
                  </Link>
                  <Link href="/about" className="btn btn--outline btn--lg">
                    About FingenIQ
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
