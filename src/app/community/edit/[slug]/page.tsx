'use client';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    company: '',
    sector: '',
    concept: '',
    rating: '',
    score: '',
    read_time: '5',
    linked_companies: '',
    published: false,
  });

  useEffect(() => {
    fetch(`/api/community/articles/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.article) {
          const a = d.article;
          let linkedStr = '';
          try {
            const arr = JSON.parse(a.linked_companies || '[]');
            linkedStr = arr.join(', ');
          } catch {
            linkedStr = '';
          }
          setForm({
            title: a.title || '',
            summary: a.summary || '',
            content: a.body || '',
            company: a.company || '',
            sector: a.sector || '',
            concept: a.concept || '',
            rating: a.rating || '',
            score: String(a.score || ''),
            read_time: String(a.read_time || 5),
            linked_companies: linkedStr,
            published: a.published === 1,
          });
        } else {
          setError('Article not found');
        }
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false));
  }, [slug]);

  function updateField(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(published: boolean) {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setError('Title, summary, and content are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const linkedCompanies = form.linked_companies
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const res = await fetch(`/api/community/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: form.content,
          company: form.company,
          sector: form.sector,
          concept: form.concept,
          rating: form.rating,
          score: parseFloat(form.score) || 0,
          read_time: parseInt(form.read_time) || 5,
          linked_companies: linkedCompanies,
          published,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/community/${slug}`);
      } else {
        setError(data.error || 'Failed to update article');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/community/articles/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/community');
      } else {
        setError(data.error || 'Failed to delete article');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#0C1628',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem',
    color: '#E6EDF6',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-sans)',
  } as const;

  const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#9AAABF',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '0.5rem',
    display: 'block',
  };

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

  return (
    <div className="page-wrapper">
      <PublicNav />
      <main className="page-main">
        <div style={{ maxWidth: 740, margin: '0 auto', padding: 'var(--sp-8) var(--sp-4)' }}>
          <button
            onClick={() => router.push(`/community/${slug}`)}
            style={{ background: 'none', border: 'none', color: 'var(--brass-400)', fontSize: 'var(--text-sm)', cursor: 'pointer', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontFamily: 'var(--font-sans)' }}
          >
            ← Back to Article
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-8)' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--ink-50)', marginBottom: 'var(--sp-2)' }}>
                Edit Article
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }}>
                Update your article details and content.
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                padding: '8px 16px',
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.25)',
                borderRadius: '0.5rem',
                color: '#FB7185',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: saving ? 'default' : 'pointer',
              }}
            >
              Delete Article
            </button>
          </div>

          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(244,63,94,0.06)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: '0.75rem',
              fontSize: '0.8rem',
              color: '#FB7185',
              marginBottom: '1.5rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{
            background: '#08101E',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '1.25rem',
            padding: '2.25rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Article Title *</label>
                <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} style={inputStyle} />
              </div>

              {/* Summary */}
              <div>
                <label style={labelStyle}>Summary *</label>
                <textarea value={form.summary} onChange={e => updateField('summary', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Two-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Company</label>
                  <input type="text" value={form.company} onChange={e => updateField('company', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sector</label>
                  <input type="text" value={form.sector} onChange={e => updateField('sector', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Concept</label>
                  <input type="text" value={form.concept} onChange={e => updateField('concept', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Rating</label>
                  <input type="text" value={form.rating} onChange={e => updateField('rating', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Score (0-10)</label>
                  <input type="number" min="0" max="10" step="0.1" value={form.score} onChange={e => updateField('score', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Read Time (min)</label>
                  <input type="number" min="1" value={form.read_time} onChange={e => updateField('read_time', e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Linked Companies */}
              <div>
                <label style={labelStyle}>Linked Companies (comma separated)</label>
                <input type="text" value={form.linked_companies} onChange={e => updateField('linked_companies', e.target.value)} style={inputStyle} />
              </div>

              {/* Content */}
              <div>
                <label style={labelStyle}>Article Content *</label>
                <textarea
                  value={form.content}
                  onChange={e => updateField('content', e.target.value)}
                  rows={20}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: '1.7' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: 'var(--ink-300)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: saving ? 'default' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Unpublish / Save Draft'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                    border: '1px solid #CEAE56',
                    borderRadius: '0.5rem',
                    color: '#060A16',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: saving ? 'default' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Update & Publish →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
