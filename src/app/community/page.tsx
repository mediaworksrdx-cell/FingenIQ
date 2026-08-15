'use client';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import { useState, useMemo, useEffect } from 'react';

const INITIAL_NOTES = [
  {
    id: 'RN001', author: 'Priya Sharma', initials: 'PS',
    company: 'Reliance Industries', sector: 'Energy & Retail',
    concept: 'Capital Structure & Valuation', rating: 'Highly Commended', score: 8.5,
    title: 'Post-Jio Capital Restructuring & Free Cash Flow Analysis',
    summary: "Evaluating RIL's strategic balance sheet shift post-Jio. EBITDA growth projections map against interest expense scales across three financial statement horizons.",
    linkedCompanies: ['Jio Financial Services', 'HDFC Bank'],
    date: '12 Jul 2026',
  },
  {
    id: 'RN002', author: 'Aryan Gupta', initials: 'AG',
    company: 'Tata Motors', sector: 'Automobile',
    concept: 'Supply Chain Risk & Leverage', rating: 'Top Tier', score: 9.0,
    title: 'EV Transition Dynamics: Capital Expenditure vs Debt Projections',
    summary: "Analysing capital structure leverage parameters supporting Jaguar Land Rover's EV pivot and battery manufacturing capital allocation timelines.",
    linkedCompanies: ['Tata Power', 'CRISIL'],
    date: '8 Jul 2026',
  },
  {
    id: 'RN003', author: 'Meera Iyer', initials: 'MI',
    company: 'HDFC Bank', sector: 'Banking & NBFC',
    concept: 'NIM Compression & Credit Risk', rating: 'Commended', score: 7.8,
    title: 'Post-Merger NIM Compression Analysis: HDFC Ltd Integration',
    summary: "A quantitative assessment of Net Interest Margin dynamics following the merger. Evaluates deposit mobilization vs loan book repricing over four quarters.",
    linkedCompanies: ['ICICI Bank', 'Kotak Mahindra Bank'],
    date: '3 Jul 2026',
  },
  {
    id: 'RN004', author: 'Vikramaditya Roy', initials: 'VR',
    company: 'Infosys', sector: 'Technology & IT',
    concept: 'DCF Valuation & Disruption', rating: 'Top Tier', score: 9.2,
    title: 'AI Services Integration Impact on IT Services Operating Margins',
    summary: "Building a 3-stage DCF model accounting for Generative AI deflationary pressure on legacy IT maintenance contracts vs high-margin transformation deals.",
    linkedCompanies: ['TCS', 'Wipro'],
    date: '28 Jun 2026',
  },
];

type User = {
  name: string;
  email: string;
  picture: string;
};

export default function CommunityPage() {
  const [sectorFilter, setSectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/community-session');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch session', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const filteredNotes = useMemo(() => {
    return INITIAL_NOTES.filter(note => {
      const matchSector = sectorFilter === 'all' || note.sector.toLowerCase().includes(sectorFilter.toLowerCase());
      const matchQuery = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.concept.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchQuery;
    });
  }, [sectorFilter, searchQuery]);

  return (
    <div className="page-wrapper">
      <PublicNav />
      
      <main className="page-main">
        <div className="container py-8">
          {!isLoading && !user ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--sp-12) var(--sp-4)',
              background: 'var(--ink-950)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-subtle)',
              textAlign: 'center',
              marginTop: 'var(--sp-8)'
            }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--ink-50)', marginBottom: 'var(--sp-4)' }}>
                Institutional Research & Peer Community
              </h1>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-300)', maxWidth: '600px', marginBottom: 'var(--sp-8)' }}>
                Join our exclusive peer network to explore financial case studies, capital structure models, and corporate valuation notes published by certified FinGenIQ finance professionals.
              </p>
              <a
                href="/api/auth/google"
                className="btn"
                style={{
                  background: '#ffffff',
                  color: '#3c4043',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9082c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9082-2.2581c-.8059.54-1.8368.859-3.0482.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9574 4.0418l3.0066-2.3318z" fill="#FBBC05"/>
                  <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </a>
            </div>
          ) : user ? (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-8)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--brass-400)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
                    🌐 Institutional Peer Network
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--ink-50)', marginBottom: 'var(--sp-3)' }}>
                    Institutional Research & Peer Community
                  </h1>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', maxWidth: '680px' }}>
                    Explore peer-reviewed financial case studies, capital structure models, and corporate valuation notes published by certified FinGenIQ finance professionals.
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', background: 'var(--ink-950)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}>
                  <img src={user.picture} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-50)' }}>{user.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)' }}>{user.email}</div>
                  </div>
                  <a href="/api/auth/community-logout" className="btn btn--outline btn--sm" style={{ marginLeft: 'var(--sp-2)' }}>
                    Sign Out
                  </a>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="card p-4" style={{ marginBottom: 'var(--sp-8)', display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Search research notes by company, title, or concept..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--sp-3) var(--sp-4)',
                      background: 'var(--ink-950)',
                      border: 'var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--ink-50)',
                      fontSize: 'var(--text-sm)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  {['all', 'Energy', 'Automobile', 'Banking', 'Technology'].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setSectorFilter(sec)}
                      className={`btn btn--sm ${sectorFilter === sec ? 'btn--primary' : 'btn--outline'}`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {sec === 'all' ? 'All Sectors' : sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}>
                {filteredNotes.map(note => (
                  <div key={note.id} className="card p-6" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                      <span className="badge badge--completed" style={{ fontSize: '10px' }}>
                        {note.sector}
                      </span>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>
                        {note.date}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink-50)', marginBottom: 'var(--sp-2)', lineHeight: 'var(--leading-snug)' }}>
                      {note.title}
                    </h3>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-4)', flex: 1 }}>
                      {note.summary}
                    </p>

                    <div style={{ paddingTop: 'var(--sp-4)', borderTop: 'var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <div className="nav__avatar" style={{ width: 28, height: 28, fontSize: '10px' }}>
                          {note.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-100)' }}>{note.author}</div>
                          <div style={{ fontSize: '10px', color: 'var(--ink-500)' }}>{note.company}</div>
                        </div>
                      </div>

                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--brass-400)' }}>
                        ★ {note.score}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
