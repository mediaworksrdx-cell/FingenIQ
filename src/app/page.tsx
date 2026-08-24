import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing">
      <PublicNav />

      <div className="page-wrapper">
        <main className="page-main">

          {/* Hero Section */}
          <section className="hero" id="hero">
            <div className="hero__bg"></div>
            <div className="hero__grid"></div>
            <div className="container relative">
              <div className="hero__content animate-fadeUp" style={{ maxWidth: '920px' }}>
                <div className="hero__eyebrow">🏛 Institution-Grade Financial Education</div>
                <h1 className="hero__title"><span className="logo-fin">Fin</span><span className="logo-gen">Gen</span><span className="logo-iq"> IQ</span> — <em style={{ whiteSpace: 'nowrap' }}>Learn. Grow. Prosper.</em></h1>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--brass-400)', marginBottom: 'var(--sp-5)' }}>
                  Empowering Financial Intelligence for Financial Freedom and Wealth Management
                </h2>
                <p className="hero__subtitle" style={{ marginBottom: 'var(--sp-5)' }}>
                  Financial success is not determined solely by how much money you earn—it is shaped by how well you understand, manage, grow, and protect your money. In today's rapidly evolving economy, financial education has become an essential life skill that empowers individuals to make informed decisions, achieve financial independence, and build lasting wealth.
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', marginBottom: 'var(--sp-8)', lineHeight: 'var(--leading-relaxed)' }}>
                  <strong style={{ color: 'var(--ink-100)' }}>FingenIQ</strong> is an institution-grade financial education platform dedicated to helping individuals develop financial intelligence through structured, practical, and AI-powered learning. Whether you are beginning your financial journey or expanding your expertise, FingenIQ equips you with the knowledge, confidence, and skills needed to navigate personal finance, investing, business, and wealth creation.
                </p>
                <div className="hero__actions">
                  <Link href="/login" className="btn btn--brass btn--lg">Enter FingenIQ →</Link>
                  <Link href="/about" className="btn btn--outline btn--lg">Read Our Story</Link>
                </div>
              </div>
            </div>
          </section>

          {/* Why Financial Education Matters */}
          <section className="py-20" id="why-it-matters">
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-14)', alignItems: 'start' }}>
                <div className="animate-fadeUp">
                  <span className="section-label">Core Philosophy</span>
                  <h2 className="section-title" style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>Why Financial Education Matters</h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-5)' }}>
                    Financial literacy is one of the strongest foundations for long-term financial well-being. People with stronger financial knowledge are generally better equipped to budget, save, invest, manage debt, avoid fraud, and make informed financial decisions.
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)' }}>
                    As digital payments, online banking, investing platforms, cryptocurrencies, and AI-powered financial services become increasingly common, understanding financial concepts has become more important than ever. Financial education empowers individuals to confidently navigate these changes while reducing costly mistakes and improving financial resilience.
                  </p>
                </div>
                <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-7)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brass-400)', marginBottom: 'var(--sp-5)' }}>Financial literacy helps individuals:</div>
                    <ul className="check-list">
                      <li>Make informed financial decisions</li>
                      <li>Build healthy money habits</li>
                      <li>Create and manage personal budgets</li>
                      <li>Save and invest with confidence</li>
                      <li>Understand banking and credit systems</li>
                      <li>Plan for major life goals</li>
                      <li>Reduce financial stress</li>
                      <li>Evaluate financial opportunities and risks</li>
                      <li>Protect wealth through informed risk management</li>
                      <li>Achieve long-term financial independence</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Path to Financial Freedom */}
          <section className="py-20" id="financial-freedom" style={{ background: 'var(--ink-950)', borderTop: 'var(--border-subtle)', borderBottom: 'var(--border-subtle)' }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-14)', alignItems: 'start' }}>
                <div className="animate-fadeUp">
                  <span className="section-label">FingenIQ Strategy</span>
                  <h2 className="section-title" style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>The Path to Financial Freedom</h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-5)' }}>
                    Financial freedom is the ability to make life choices without being constrained by financial stress. It is achieved through consistent financial discipline, informed decision-making, and long-term planning.
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)' }}>
                    Financial freedom is not an overnight achievement — it is the result of continuous learning and smart financial decisions.
                  </p>
                </div>
                <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-7)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brass-400)', marginBottom: 'var(--sp-5)' }}>FingenIQ helps learners build the knowledge required to:</div>
                    <ul className="check-list">
                      <li>Create realistic financial goals</li>
                      <li>Build emergency funds</li>
                      <li>Eliminate unnecessary debt</li>
                      <li>Increase savings and investments</li>
                      <li>Generate multiple income streams</li>
                      <li>Understand passive income opportunities</li>
                      <li>Plan for financial independence</li>
                      <li>Preserve wealth across generations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Who Can Benefit */}
          <section className="py-20" id="who-benefits" style={{ background: 'var(--ink-950)', borderTop: 'var(--border-subtle)', borderBottom: 'var(--border-subtle)' }}>
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ marginBottom: 'var(--sp-12)' }}>
                <span className="section-label">FingenIQ Ecosystem</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-3)' }}>Who Can Benefit?</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-6)' }}>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '0ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🎓</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>Students</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Build a strong financial foundation early and develop lifelong money management skills, preparing for higher education, careers, entrepreneurship, and responsible financial decision-making.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '80ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>💼</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>Professionals</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Learn to effectively manage income, savings, taxes, investments, retirement planning, and long-term financial goals while improving overall financial well-being.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '160ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🚀</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>Entrepreneurs</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Understand business finance, cash flow management, funding strategies, financial planning, profitability, and sustainable business growth to make informed business decisions.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '240ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>📈</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>Investors</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Develop the knowledge and analytical skills to evaluate investment opportunities, diversify portfolios, understand financial markets, manage risk, and build long-term wealth.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '320ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>👨‍👩‍👧</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>Families</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Plan household finances, manage expenses, protect assets, prepare for education and retirement, and work toward shared financial goals with greater confidence.</p>
                </div>
                <div className="card p-6 animate-fadeUp" style={{ animationDelay: '400ms' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>🌍</div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-2)' }}>Lifelong Learners</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>Strengthen financial confidence, stay informed about evolving financial systems, adapt to changing economic environments, and continue developing financial intelligence throughout life.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Learn Beyond Theory */}
          <section className="py-20" id="beyond-theory" style={{ background: 'var(--ink-950)', borderTop: 'var(--border-subtle)', borderBottom: 'var(--border-subtle)' }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'var(--sp-14)', alignItems: 'start' }}>
                <div className="animate-fadeUp">
                  <span className="section-label">Practical Learning</span>
                  <h2 className="section-title" style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>Learn Beyond Theory</h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-5)' }}>
                    FingenIQ combines academic-quality financial education with practical, real-world learning experiences. Learners explore financial concepts through multiple modalities.
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic' }}>
                    The focus is not simply on understanding concepts, but on applying them confidently in everyday financial situations.
                  </p>
                </div>
                <div className="grid animate-fadeUp" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', animationDelay: '100ms' }}>
                  {[
                    { title: 'Interactive Learning', desc: 'Scenario-based exercises, financial calculators, and compound modelers.' },
                    { title: 'Visual Explanations', desc: 'Complex macroeconomics translated into clean infographics and diagrams.' },
                    { title: 'Business Case Studies', desc: 'Real-world corporate restructurings, financial plans, and industry audits.' },
                    { title: 'Industry Case Studies', desc: 'Sector-specific scenarios grounded in real market conditions and data.' },
                    { title: 'AI Learning Assistance', desc: 'Contextual AI tutor that adapts explanations to your quiz performance.' },
                    { title: 'Practical Activities', desc: 'Assignments that apply concepts to personal and business finance scenarios.' },
                    { title: 'Knowledge Assessments', desc: 'Ungraded KCs, graded quizzes, proctored module tests, and a capstone project.' },
                    { title: 'Revision & Reinforcement', desc: 'Flashcard decks, concept summaries, and AI-generated study notes.' }
                  ].map((item, idx) => (
                    <div key={idx} className="card p-5">
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brass-400)', marginBottom: 'var(--sp-2)' }}>{item.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Building Financial Intelligence */}
          <section className="py-20" id="financial-intelligence">
            <div className="container">
              <div className="section-header text-center animate-fadeUp" style={{ marginBottom: 'var(--sp-10)' }}>
                <span className="section-label">Critical Capabilities</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-3)' }}>Building Financial Intelligence</h2>
                <p className="section-subtitle mx-auto" style={{ marginTop: 'var(--sp-4)' }}>
                  Financial intelligence goes beyond knowing definitions or formulas. It is the ability to think, evaluate, and decide with clarity. These are lifelong skills that support both personal success and professional development.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
                {[
                  'Think critically about financial decisions',
                  'Evaluate risks and opportunities',
                  'Interpret financial information',
                  'Understand economic events',
                  'Analyze business performance',
                  'Make informed investment decisions',
                  'Plan for long-term financial goals',
                  'Adapt to changing financial environments'
                ].map((intel, idx) => (
                  <div key={idx} className="card p-4 animate-fadeUp" style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-300)', fontWeight: 500, lineHeight: 'var(--leading-relaxed)', animationDelay: `${idx * 50}ms` }}>
                    {intel}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AI-Powered Learning */}
          <section className="py-20" id="ai-learning" style={{ background: 'var(--ink-950)', borderTop: 'var(--border-subtle)', borderBottom: 'var(--border-subtle)' }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-14)', alignItems: 'start' }}>
                <div className="animate-fadeUp">
                  <span className="section-label">Personalized Assistance</span>
                  <h2 className="section-title" style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>AI-Powered Personalized Learning</h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-4)' }}>
                    FingenIQ integrates intelligent AI assistance to make financial education more accessible and engaging. This creates a learning experience that adapts to different learning styles and individual needs.
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)' }}>
                    The AI Tutor is contextualised per lesson — it understands exactly which step you are on, what concepts were covered, and where your quiz results indicate gaps. Explanations are never generic.
                  </p>
                </div>
                <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-7)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brass-400)', marginBottom: 'var(--sp-5)' }}>Learners can:</div>
                    <ul className="bullet-list">
                      <li>Ask questions anytime — contextualised to the current lesson step</li>
                      <li>Simplify complex concepts in plain language</li>
                      <li>Explore real-world examples on demand</li>
                      <li>Receive personalized explanations based on quiz results</li>
                      <li>Generate custom study notes and concept summaries</li>
                      <li>Review and reinforce difficult topics</li>
                      <li>Reinforce learning through AI-guided practice sessions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Supporting Financial Well-Being */}
          <section className="py-20" id="financial-wellbeing">
            <div className="container container--narrow">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-12)', alignItems: 'center' }}>
                <div className="animate-fadeUp">
                  <span className="section-label">Broader Impact</span>
                  <h2 className="section-title" style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>Supporting Financial Well-Being</h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)' }}>
                    Strong financial literacy supports better financial behaviors, improved money management, informed investment decisions, and greater financial resilience. By developing financial intelligence, individuals are better prepared to navigate economic uncertainty, achieve long-term goals, and build sustainable financial well-being for themselves and their families.
                  </p>
                </div>
                <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 'var(--sp-2)' }}>💡</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', fontWeight: 500 }}>Better Financial Behaviours</div>
                    </div>
                    <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 'var(--sp-2)' }}>📊</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', fontWeight: 500 }}>Improved Money Management</div>
                    </div>
                    <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 'var(--sp-2)' }}>📈</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', fontWeight: 500 }}>Informed Investment Decisions</div>
                    </div>
                    <div style={{ background: 'var(--ink-900)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 'var(--sp-2)' }}>🛡️</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', fontWeight: 500 }}>Greater Financial Resilience</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gateway CTA */}
          <section className="py-20" id="enter-platform" style={{ background: 'var(--ink-950)', borderTop: 'var(--border-subtle)', textAlign: 'center' }}>
            <div className="container container--narrow" style={{ position: 'relative', zIndex: 1 }}>
              <div className="animate-fadeUp" style={{ textAlign: 'center' }}>
                <span className="section-label">Ready to Begin?</span>
                <h2 className="section-title" style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-5)', fontSize: 'var(--text-5xl)' }}>
                  Learn Smarter.<br /><em>Manage Wealth. Achieve Financial Freedom.</em>
                </h2>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-300)', maxWidth: '500px', margin: '0 auto var(--sp-10)', lineHeight: 'var(--leading-relaxed)' }}>
                  Access your personal dashboard, 44 structured lessons, proctored assessments, certification tracking, and an AI tutor — all inside FingenIQ.
                </p>
                <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/login" className="btn btn--brass btn--lg" style={{ fontSize: 'var(--text-base)', padding: 'var(--sp-4) var(--sp-10)' }}>
                    Enter FingenIQ →
                  </Link>
                  <Link href="/curriculum" className="btn btn--outline btn--lg">
                    Browse Curriculum
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
