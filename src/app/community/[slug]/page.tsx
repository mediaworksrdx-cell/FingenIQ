'use client';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import BuiltInComments from '@/components/community/BuiltInComments';
import DisqusComments from '@/components/community/DisqusComments';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  author_id: string;
  author_name: string;
  author_bio: string;
  company: string;
  sector: string;
  concept: string;
  rating: string;
  score: number;
  read_time: number;
  claps: number;
  linked_companies: string;
  published: number;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  userId: string;
  name: string;
  role: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch article
    fetch(`/api/community/articles/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setArticle(d.article);
        else setError(d.error || 'Article not found');
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false));

    // Check auth
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d.success) setUser({ userId: d.userId, name: d.name || 'User', role: d.role });
      })
      .catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <PublicNav />
        <main className="page-main" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--ink-400)', fontSize: 'var(--text-md)' }}>Loading article...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="page-wrapper">
        <PublicNav />
        <main className="page-main" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <p style={{ color: 'var(--ink-400)', fontSize: 'var(--text-md)' }}>{error || 'Article not found'}</p>
          <Link href="/community" style={{ color: 'var(--brass-400)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>← Back to Community</Link>
        </main>
        <Footer />
      </div>
    );
  }

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

  let linkedCompanies: string[] = [];
  try {
    linkedCompanies = JSON.parse(article.linked_companies || '[]');
  } catch {
    linkedCompanies = [];
  }

  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="page-wrapper">
      <PublicNav />
      <main className="page-main">
        <article style={{ maxWidth: 740, margin: '0 auto', padding: 'var(--sp-8) var(--sp-4)' }}>
          {/* Back button */}
          <Link
            href="/community"
            style={{ background: 'none', border: 'none', color: 'var(--brass-400)', fontSize: 'var(--text-sm)', cursor: 'pointer', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontFamily: 'var(--font-sans)', textDecoration: 'none' }}
          >
            ← Back to Community
          </Link>

          {/* Author header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--navy-700), var(--navy-900))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--brass-400)', flexShrink: 0 }}>
              {getInitials(article.author_name)}
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)' }}>{article.author_name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
                {article.author_bio && `${article.author_bio} · `}{formatDate(article.created_at)} · {article.read_time} min read
              </div>
            </div>
          </div>

          {/* Edit button for author/admin */}
          {user && (user.role === 'admin' || user.userId === article.author_id) && (
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <Link
                href={`/community/edit/${article.slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
                  padding: '6px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
                  color: 'var(--ink-300)', fontSize: 'var(--text-xs)', textDecoration: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                ✏️ Edit Article
              </Link>
            </div>
          )}

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--ink-50)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--sp-4)', letterSpacing: 'var(--tracking-tight)' }}>
            {article.title}
          </h1>

          {/* Meta tags */}
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-6)' }}>
            {article.sector && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(184,150,46,0.12)', color: 'var(--brass-400)', fontWeight: 600 }}>{article.sector}</span>
            )}
            {article.concept && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(59,130,246,0.12)', color: 'var(--sapphire-400)', fontWeight: 600 }}>{article.concept}</span>
            )}
            {article.score > 0 && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.12)', color: 'var(--emerald-400)', fontWeight: 600 }}>★ {article.score}/10{article.rating && ` · ${article.rating}`}</span>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: 'var(--sp-8)' }} />

          {/* Article body */}
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', color: 'var(--ink-200)', lineHeight: 'var(--leading-loose)', letterSpacing: '0.01em' }}>
            {article.body.split('\n\n').map((para, i) => {
              if (para.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--ink-100)', marginTop: 'var(--sp-8)', marginBottom: 'var(--sp-4)', lineHeight: 'var(--leading-snug)' }}>{para.replace('## ', '')}</h2>;
              if (para.startsWith('### ')) return <h3 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--ink-100)', marginTop: 'var(--sp-6)', marginBottom: 'var(--sp-3)' }}>{para.replace('### ', '')}</h3>;
              if (para.startsWith('**') && para.includes(':**')) {
                const [bold, ...rest] = para.split(':**');
                return <p key={i} style={{ marginBottom: 'var(--sp-4)' }}><strong style={{ color: 'var(--brass-400)' }}>{bold.replace(/\*\*/g, '')}:</strong>{rest.join(':**')}</p>;
              }
              if (para.startsWith('|')) {
                const rows = para.split('\n').filter(r => r.trim() && !r.startsWith('|---'));
                const headers = rows[0]?.split('|').filter(Boolean).map(h => h.trim());
                const dataRows = rows.slice(1).map(r => r.split('|').filter(Boolean).map(c => c.trim()));
                return (
                  <div key={i} style={{ overflowX: 'auto', marginBottom: 'var(--sp-4)', marginTop: 'var(--sp-2)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                      <thead>
                        <tr>{headers?.map((h, j) => <th key={j} style={{ textAlign: 'left', padding: 'var(--sp-2) var(--sp-3)', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--ink-300)', fontWeight: 600 }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {dataRows.map((row, ri) => (
                          <tr key={ri}>{row.map((cell, ci) => <td key={ci} style={{ padding: 'var(--sp-2) var(--sp-3)', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--ink-300)' }}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              if (para.startsWith('- ')) {
                return <ul key={i} style={{ marginBottom: 'var(--sp-4)', paddingLeft: 'var(--sp-6)' }}>{para.split('\n').map((li, j) => <li key={j} style={{ marginBottom: 'var(--sp-2)', color: 'var(--ink-200)' }}>{li.replace('- ', '')}</li>)}</ul>;
              }
              return <p key={i} style={{ marginBottom: 'var(--sp-4)' }}>{para}</p>;
            })}
          </div>

          {/* Linked companies */}
          {linkedCompanies.length > 0 && (
            <div style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-4) var(--sp-5)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>Linked Companies</div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                {linkedCompanies.map(c => <span key={c} style={{ fontSize: 'var(--text-xs)', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', color: 'var(--ink-300)' }}>{c}</span>)}
              </div>
            </div>
          )}

          {/* Engagement bar */}
          <div style={{ marginTop: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', padding: 'var(--sp-4) 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }}>👏 {article.claps}</span>
          </div>

          {/* Discussion Section */}
          {disqusShortname ? (
            <DisqusComments articleSlug={article.slug} articleTitle={article.title} articleUrl={articleUrl} />
          ) : (
            <BuiltInComments articleSlug={article.slug} user={user ? { name: user.name, role: user.role } : null} />
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
