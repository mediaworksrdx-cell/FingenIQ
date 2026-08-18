'use client';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { communityLogoutAction } from '@/app/actions/communityAuthActions';

/* ─── TYPES ─────────────────────────────────────────────────────────────────── */
type AuthUser = { userId: string; name: string; role: string };
interface Article {
  id: number;
  slug: string;
  title: string;
  summary: string;
  author_name: string;
  author_bio: string;
  sector: string;
  concept: string;
  score: number;
  rating: string;
  read_time: number;
  claps: number;
  created_at: string;
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────────── */
export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    // Check auth session
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUser({ userId: d.userId, name: d.name || 'User', role: d.role });
        }
      })
      .catch(() => {});

    // Fetch articles
    fetch('/api/community/articles')
      .then(r => r.json())
      .then(d => {
        if (d.success) setArticles(d.articles || []);
      })
      .catch(() => {})
      .finally(() => setLoadingArticles(false));
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchSector = sectorFilter === 'all' || (a.sector && a.sector.toLowerCase().includes(sectorFilter.toLowerCase()));
      const matchQuery = !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.author_name && a.author_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.sector && a.sector.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.concept && a.concept.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSector && matchQuery;
    });
  }, [sectorFilter, searchQuery, articles]);

  // Dynamically build sector list from articles
  const sectors = useMemo(() => {
    const sectorSet = new Set<string>();
    articles.forEach(a => {
      if (a.sector) {
        // Extract primary sector keyword
        const primary = a.sector.split('&')[0].trim().split(' ')[0];
        sectorSet.add(primary);
      }
    });
    return ['all', ...Array.from(sectorSet)];
  }, [articles]);

  const canPost = user && (user.role === 'admin' || user.role === 'employee');

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  /* ─── ARTICLE FEED VIEW (Medium-style) ──────────────────────────────────── */
  return (
    <div className="page-wrapper">
      <PublicNav />
      <main className="page-main">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--sp-8) var(--sp-4)' }}>

          {/* Community Header */}
          <header style={{ marginBottom: 'var(--sp-8)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--brass-400)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
              FinGenIQ Community
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 2.75rem)', color: 'var(--ink-50)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--sp-3)', letterSpacing: 'var(--tracking-tight)' }}>
              Institutional Research & Peer Insights
            </h1>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-400)', maxWidth: 560, margin: '0 auto', lineHeight: 'var(--leading-relaxed)' }}>
              Peer-reviewed financial case studies, valuation models, and sector analysis published by certified professionals.
            </p>

            {/* User bar */}
            <div style={{ marginTop: 'var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              {user ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-2) var(--sp-4)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--navy-700), var(--navy-900))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: 'var(--brass-400)',
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)' }}>{user.name}</span>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--brass-400)', padding: '2px 8px', background: 'rgba(184,150,46,0.08)', borderRadius: 'var(--radius-full)' }}>
                    {user.role === 'community_member' ? 'Member' : user.role === 'learner' ? 'Learner' : user.role === 'admin' ? 'Admin' : user.role === 'employee' ? 'Staff' : user.role}
                  </span>
                  <button
                    onClick={async () => {
                      await communityLogoutAction();
                      setUser(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-500)',
                      fontSize: 'var(--text-2xs)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      textDecoration: 'underline',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/community/login?redirect=/community"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 18px',
                    background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                    color: '#060A16', border: '1px solid #CEAE56',
                    borderRadius: '0.5rem', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign In / Register
                </Link>
              )}

              {canPost && (
                <Link
                  href="/community/new"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px',
                    background: 'rgba(184,150,46,0.12)',
                    color: 'var(--brass-400)',
                    border: '1px solid rgba(184,150,46,0.25)',
                    borderRadius: '0.5rem', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  ✍️ New Article
                </Link>
              )}
            </div>
          </header>

          {/* Search & Sector Filters */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--sp-8)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', color: 'var(--ink-100)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-1)', flexWrap: 'wrap' }}>
              {sectors.map(s => (
                <button
                  key={s}
                  onClick={() => setSectorFilter(s)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: sectorFilter === s ? 'var(--ink-100)' : 'transparent',
                    color: sectorFilter === s ? 'var(--ink-950)' : 'var(--ink-400)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: sectorFilter === s ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s',
                  }}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loadingArticles && (
            <div style={{ textAlign: 'center', padding: 'var(--sp-12) 0' }}>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-500)' }}>Loading articles...</p>
            </div>
          )}

          {/* Article Feed */}
          {!loadingArticles && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
              {filteredArticles.map((article, idx) => (
                <Link
                  key={article.id}
                  href={`/community/${article.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    paddingBottom: 'var(--sp-8)',
                    borderBottom: idx < filteredArticles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {/* Author line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--navy-700), var(--navy-900))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--brass-400)' }}>
                      {getInitials(article.author_name)}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-300)' }}>{article.author_name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-600)' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>{formatDate(article.created_at)}</span>
                  </div>

                  {/* Title & summary */}
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--ink-50)', lineHeight: 'var(--leading-snug)', marginBottom: 'var(--sp-2)', letterSpacing: 'var(--tracking-tight)' }}>
                    {article.title}
                  </h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-4)', maxWidth: 640 }}>
                    {article.summary}
                  </p>

                  {/* Bottom meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                    {article.sector && (
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', color: 'var(--ink-400)' }}>{article.sector}</span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>{article.read_time} min read</span>
                    {article.score > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>★ {article.score}/10</span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>👏 {article.claps}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loadingArticles && filteredArticles.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--sp-12) 0' }}>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-500)', marginBottom: 'var(--sp-4)' }}>
                {articles.length === 0 ? 'No articles published yet.' : 'No articles found matching your search.'}
              </p>
              {canPost && articles.length === 0 && (
                <Link
                  href="/community/new"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                    color: '#060A16', border: '1px solid #CEAE56',
                    borderRadius: '0.5rem', fontSize: '14px', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  ✍️ Write the First Article
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
