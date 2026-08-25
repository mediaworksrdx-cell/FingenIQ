import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

export const metadata = {
  title: 'About Us | FinGenIQ',
  description: 'Financial clarity belongs to everyone. From families to governments, we build the simple systems that secure long-term wealth.',
};

export default function About() {
  return (
    <div className="landing" style={{ minHeight: '100vh', background: '#FAF8F5' }}>
      <PublicNav />

      <div className="page-wrapper">
        <main className="page-main">

          {/* ── HERO SECTION ───────────────────────────────────────────── */}
          <section className="hero" id="about-hero" style={{ padding: '6rem 0 3.5rem 0', position: 'relative', overflow: 'hidden' }}>
            <div className="hero__bg"></div>
            <div className="hero__grid"></div>
            <div className="container relative">
              <div className="hero__content animate-fadeUp" style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
                <div className="hero__eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', color: '#15803D', fontWeight: 700, padding: '4px 14px', borderRadius: '9999px', fontSize: '0.8rem' }}>
                  <span>💡</span> OUR PHILOSOPHY
                </div>

                <h1 className="hero__title" style={{ fontSize: 'clamp(2rem, 5.5vw, 3.4rem)', fontWeight: 800, color: '#0F172A', lineHeight: 1.18, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                  Financial clarity belongs to everyone.
                </h1>

                <p style={{ fontSize: 'clamp(1.15rem, 3.2vw, 1.45rem)', fontWeight: 600, color: '#15803D', marginBottom: '1.5rem', lineHeight: 1.4, maxWidth: '720px', margin: '0 auto 1.5rem auto' }}>
                  From families to governments, we build the simple systems that secure long-term wealth.
                </p>

                <p className="hero__subtitle" style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.65, maxWidth: '680px', margin: '0 auto 1.5rem auto' }}>
                  <strong style={{ color: '#0F172A' }}>FinGenIQ</strong> combines AI, financial intelligence, and human expertise to make financial education radically simpler, smarter, and more practical.
                </p>

                {/* Collaboration Box */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  maxWidth: '700px',
                  margin: '1.75rem auto 0 auto',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                    🌐 Global Collaborative Intelligence
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: 1.55 }}>
                    Built through the collaboration of <strong>Vivin Synergy (UAE)</strong> and <strong>Synthetix Analytics (India)</strong>, FinGenIQ is designed to help people understand money, make better decisions, and build wealth that lasts for generations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── BOLD MANIFESTO BANNER ───────────────────────────────────── */}
          <section style={{ padding: '3.5rem 0', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', textAlign: 'center', position: 'relative' }}>
            <div className="container container--narrow">
              <div className="animate-fadeUp" style={{ padding: '0 1rem' }}>
                <p style={{ fontSize: 'clamp(1.25rem, 4vw, 1.85rem)', fontWeight: 600, color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                  We don&apos;t teach people to chase markets.
                </p>
                <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, color: '#4ADE80', margin: '0.5rem 0 0 0', letterSpacing: '-0.02em', textShadow: '0 0 30px rgba(74, 222, 128, 0.3)' }}>
                  We teach them to think.
                </h2>
              </div>
            </div>
          </section>

          {/* ── VISION & MISSION DUAL CARDS ─────────────────────────────── */}
          <section className="py-20" id="vision-mission" style={{ padding: '4.5rem 0', background: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ maxWidth: '640px', margin: '0 auto 3rem auto' }}>
                <span className="section-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Our Guiding Purpose
                </span>
                <h2 className="section-title" style={{ fontSize: 'clamp(1.85rem, 5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
                  Vision &amp; Mission
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                maxWidth: '1050px',
                margin: '0 auto',
              }}>
                {/* 1. Vision Card (First) */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1.25rem',
                  padding: '2.25rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #15803D, #22C55E)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FinGenIqLogo size={24} showText={false} />
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Our Vision</h3>
                  </div>
                  <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                    To empower individuals, businesses, and families worldwide to build, grow, and preserve wealth through intelligent financial technology, deep business intelligence, and world-class education—powered by a global community of industry leaders and academic experts to create enduring, generational impact.
                  </p>
                </div>

                {/* 2. Mission Card (Next) */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1.25rem',
                  padding: '2.25rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  position: 'relative',
                  overflow: 'hidden',
                  animationDelay: '100ms',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #15803D, #22C55E)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FinGenIqLogo size={24} showText={false} />
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Our Mission</h3>
                  </div>
                  <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                    To empower people worldwide with world-class financial knowledge, intelligent technology, and practical tools to make better financial decisions, build lasting wealth, and achieve true financial independence across generations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── WHAT WE BELIEVE (4 PILLARS) ─────────────────────────────── */}
          <section className="py-20" id="what-we-believe" style={{ padding: '4.5rem 0' }}>
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ maxWidth: '640px', margin: '0 auto 3rem auto' }}>
                <span className="section-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Our Core Pillars
                </span>
                <h2 className="section-title" style={{ fontSize: 'clamp(1.85rem, 5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  What We Believe
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(206,174,86,0.12)', border: '1px solid rgba(206,174,86,0.3)', padding: '6px 16px', borderRadius: '9999px', color: '#B45309', fontWeight: 700, fontSize: '0.88rem' }}>
                  Understand. Decide. Build. Protect.
                </div>
              </div>

              <div className="pillars-2x2-grid">
                {/* Pillar 1 */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'rgba(22,163,74,0.1)', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🤖
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    AI Intelligence
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Turn complex financial information into clear, actionable decisions with intuitive generative modeling and real-time guidance.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  animationDelay: '100ms',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'rgba(37,99,235,0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🌐
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Real-World Knowledge
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Learn from people who have actually worked with capital, global markets, financial institutions, and enterprise businesses.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  animationDelay: '150ms',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'rgba(180,83,9,0.1)', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    📈
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Long-Term Wealth
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Focus on building, growing, and protecting enduring wealth across compounding cycles—not short-term speculation or noise.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  animationDelay: '200ms',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🎯
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Personalized Learning
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    The right financial knowledge and interactive simulators tailored for every stage of personal, professional, and family life.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── WHO WE EMPOWER ─────────────────────────────────────────── */}
          <section className="py-20" id="who-we-empower" style={{ padding: '4.5rem 0', background: 'rgba(255, 255, 255, 0.6)', borderTop: '1px solid rgba(0, 0, 0, 0.06)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                <span className="section-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Targeted Impact
                </span>
                <h2 className="section-title" style={{ fontSize: 'clamp(1.85rem, 5vw, 2.6rem)', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
                  Who We Empower
                </h2>
                <p style={{ fontSize: '1rem', color: '#64748B', marginTop: '0.5rem' }}>
                  Structured pathways built to empower every individual at every milestone.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1000px',
                margin: '0 auto',
              }}>
                {/* Students */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(22,163,74,0.2)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 6px 24px rgba(22, 163, 74, 0.06)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Students
                  </h3>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#15803D', marginBottom: '0.75rem' }}>
                    Start financially smart.
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Build rock-solid money habits, master banking fundamentals, understand credit, and start compound investing early.
                  </p>
                </div>

                {/* Professionals */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(37,99,235,0.2)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 6px 24px rgba(37, 99, 235, 0.06)',
                  textAlign: 'center',
                  animationDelay: '100ms',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💼</div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Professionals
                  </h3>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#2563EB', marginBottom: '0.75rem' }}>
                    Turn income into long-term financial independence.
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Optimize equity portfolios, master corporate finance &amp; valuation, and convert active earning power into self-sustaining capital.
                  </p>
                </div>

                {/* Families */}
                <div className="card animate-fadeUp" style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(180,83,9,0.2)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 6px 24px rgba(180, 83, 9, 0.06)',
                  textAlign: 'center',
                  animationDelay: '200ms',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏡</div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Families
                  </h3>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#B45309', marginBottom: '0.75rem' }}>
                    Build wealth that can outlive a generation.
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Safeguard estates, protect assets from downside risk, navigate insurance, and establish multi-generational financial freedom.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── MISSION SUMMARY & CTA ──────────────────────────────────── */}
          <section style={{ padding: '5rem 0', textAlign: 'center', background: '#FAF8F5' }}>
            <div className="container container--narrow animate-fadeUp">
              <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #15803D 100%)',
                borderRadius: '1.5rem',
                padding: '3rem 2rem',
                color: '#FFFFFF',
                boxShadow: '0 12px 40px rgba(22, 163, 74, 0.15)',
              }}>
                <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem', lineHeight: 1.25 }}>
                  FinGenIQ helps people understand money, make smarter financial decisions, and build lasting wealth.
                </h2>
                <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '520px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                  Join 44 comprehensive lessons across 8 foundational modules with AI-powered personalized mentoring.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/login"
                    className="btn btn--brass btn--lg"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      color: '#FFFFFF',
                      padding: '0.85rem 1.75rem',
                      fontWeight: 700,
                      borderRadius: '0.65rem',
                      border: 'none',
                    }}
                  >
                    Enter FinGenIQ →
                  </Link>
                  <Link
                    href="/curriculum"
                    className="btn btn--outline btn--lg"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '0.85rem 1.75rem',
                      fontWeight: 600,
                      borderRadius: '0.65rem',
                    }}
                  >
                    Explore Curriculum
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
