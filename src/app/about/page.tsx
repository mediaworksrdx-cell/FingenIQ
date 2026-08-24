import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'About Us',
  description: 'Transforming static financial theory into lifelong financial confidence and wealth management.',
};

export default function About() {
  return (
    <div className="landing">
      <PublicNav />

      <div className="page-wrapper">
        <main className="page-main">

          {/* Page Hero */}
          <section className="hero" id="about-hero" style={{ minHeight: '55vh' }}>
            <div className="hero__bg"></div>
            <div className="hero__grid"></div>
            <div className="container relative">
              <div className="hero__content animate-fadeUp" style={{ maxWidth: '700px' }}>
                <div className="hero__eyebrow">ℹ️ Our Philosophy</div>
                <h1 className="hero__title">About <em>FingenIQ</em></h1>
                <p className="hero__subtitle">
                  Transforming static textbook theory into lifelong financial confidence and wealth management. We are an institution-grade financial education platform dedicated to empowering individuals with practical, structured, AI-powered learning.
                </p>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="py-20 bg-900 border-muted" id="mission">
            <div className="container container--narrow">
              <div className="section-header text-center animate-fadeUp">
                <span className="section-label">Why We Exist</span>
                <h2 className="section-title">Our Mission</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', color: 'var(--ink-300)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }} className="animate-fadeUp">
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-100)', fontWeight: 500, lineHeight: 'var(--leading-relaxed)', borderLeft: '3px solid var(--brass-500)', paddingLeft: 'var(--sp-4)' }}>
                  To empower people worldwide with world-class financial knowledge and intelligent technology to make better decisions, build lasting wealth, and achieve financial independence across generations.
                </p>
                <p>
                  FingenIQ is an institution-grade financial education platform dedicated to helping individuals develop financial intelligence through structured, practical, and AI-powered learning. Whether you are beginning your financial journey or expanding your expertise, FingenIQ equips you with the knowledge, confidence, and skills needed to navigate personal finance, investing, business, and wealth creation.
                </p>
                <p>
                  Financial success is not determined solely by how much money you earn — it is shaped by how well you understand, manage, grow, and protect your money. Through FingenIQ's structured curriculum, AI-powered tools, and professional certification framework, we ensure that every learner walks away with actionable, real-world financial intelligence.
                </p>
              </div>
            </div>
          </section>

          {/* Vision */}
          <section className="py-20" id="vision">
            <div className="container container--narrow">
              <div className="card p-8 card--credential animate-fadeUp">
                <span className="section-label" style={{ marginBottom: 'var(--sp-4)', display: 'block' }}>Our North Star</span>
                <h2 className="section-title mb-4">Our Vision</h2>
                <p className="text-secondary" style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-100)', lineHeight: 'var(--leading-relaxed)', fontWeight: 500 }}>
                  To empower individuals and businesses worldwide to build, grow, and preserve wealth through intelligent financial technology, deep business intelligence, and world-class education—powered by a global community of industry leaders and academic experts to create enduring, generational impact.
                </p>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="py-20 bg-900 border-muted" id="values">
            <div className="container">
              <div className="section-header text-center animate-fadeUp">
                <span className="section-label">What Drives Us</span>
                <h2 className="section-title">Our Core Values</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🎯</div>
                  <h3 className="font-semi text-brass mb-3">Academic Rigour</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Every lesson, module, and assessment is built to institution-grade standards. Our 20-step framework ensures deep, structured comprehension — not surface-level familiarity.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '200ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🤝</div>
                  <h3 className="font-semi text-brass mb-3">Universal Accessibility</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>World-class financial education should not be gated by income, geography, or privilege. FingenIQ is built to serve students, professionals, entrepreneurs, and families equally.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '300ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🤖</div>
                  <h3 className="font-semi text-brass mb-3">AI-Powered Personalisation</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Our AI Tutor adapts to each learner's pace, identifies knowledge gaps, generates remediation plans, and provides contextual explanations at every step of the journey.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🏅</div>
                  <h3 className="font-semi text-brass mb-3">Verifiable Credentials</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Three distinct certification tiers — Completion, Proficiency, and Distinction — with tamper-proof verification codes and a professional marketplace to showcase your achievements.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '200ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>📊</div>
                  <h3 className="font-semi text-brass mb-3">Outcome-Oriented Design</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Every component of the platform — lessons, knowledge checks, quizzes, assignments, module assessments, and the capstone — is designed to produce measurable financial competency gains.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '300ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🌱</div>
                  <h3 className="font-semi text-brass mb-3">Lifelong Learning</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Financial education is not a one-time event. FingenIQ is built as a lifelong companion — continuously updated to reflect regulatory changes, market developments, and evolving best practices.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Differentiators */}
          <section className="py-20" id="differentiation">
            <div className="container">
              <div className="section-header text-center animate-fadeUp">
                <span className="section-label">Platform Differentiators</span>
                <h2 className="section-title">What Makes FingenIQ Different</h2>
                <p className="section-subtitle mx-auto" style={{ marginTop: 'var(--sp-4)' }}>Most financial education platforms offer scattered videos and generic content. FingenIQ is built from the ground up as a structured, outcome-driven credentialing body.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-8)', marginTop: 'var(--sp-8)' }}>
                <div className="animate-fadeUp">
                  <h3 className="text-lg font-semi text-brass mb-4">The FingenIQ Difference</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <div className="card p-4" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'start' }}>
                      <span className="text-brass font-bold">01</span>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-1)' }}>20-Step Lesson Framework</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Every lesson follows a structured 20-step methodology spanning orientation, concept delivery, visual explanation, case study, knowledge check, and reflection.</p>
                      </div>
                    </div>
                    <div className="card p-4" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'start' }}>
                      <span className="text-brass font-bold">02</span>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-1)' }}>Weighted Scoring Architecture</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Certification is determined by a composite weighted score: KCs (10%), Assignments (15%), Quizzes (25%), Module Assessments (30%), and Capstone (20%).</p>
                      </div>
                    </div>
                    <div className="card p-4" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'start' }}>
                      <span className="text-brass font-bold">03</span>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-1)' }}>Proctored Assessments</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Module-level assessments are conducted under remote proctoring with webcam monitoring and tab-switch detection, ensuring the integrity of issued credentials.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-lg font-semi text-brass mb-4">Professional Recognition</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <div className="card p-4" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'start' }}>
                      <span className="text-brass font-bold">04</span>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-1)' }}>SEBI-Equivalence Roadmap</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>FingenIQ is actively building a roadmap towards SEBI regulatory recognition. Our curriculum is benchmarked against CA/ICWA, CFA Level I, and BPF professional standards.</p>
                      </div>
                    </div>
                    <div className="card p-4" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'start' }}>
                      <span className="text-brass font-bold">05</span>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-1)' }}>Talent Marketplace</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Certified learners gain access to a professional talent marketplace where employers can discover, filter, and recruit verified FingenIQ-certified financial talent.</p>
                      </div>
                    </div>
                    <div className="card p-4" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'start' }}>
                      <span className="text-brass font-bold">06</span>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-1)' }}>Shareable Verified Credentials</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Every issued credential carries a unique tamper-evident verification code that can be shared publicly on LinkedIn, resumes, and professional portfolios.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 bg-900 border-muted" style={{ textAlign: 'center' }}>
            <div className="container container--narrow animate-fadeUp">
              <h2 className="section-title mb-4">Start Your Financial Education Journey</h2>
              <p className="text-secondary mx-auto mb-8" style={{ maxWidth: '440px' }}>44 lessons, 8 modules, 3 credential tiers, and an AI tutor — all waiting for you inside the platform.</p>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn btn--brass btn--lg">Enter FingenIQ →</Link>
                <Link href="/contact" className="btn btn--outline btn--lg">Get in Touch</Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
