'use client';
import { useState, useEffect } from 'react';

interface Comment {
  id: number;
  user_name: string;
  body: string;
  likes: number;
  created_at: string;
}

interface BuiltInCommentsProps {
  articleSlug: string;
  user: { name: string; role: string } | null;
}

export default function BuiltInComments({ articleSlug, user }: BuiltInCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleSlug]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/community/articles/${articleSlug}/comments`);
      const data = await res.json();
      if (data.success) setComments(data.comments);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/articles/${articleSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText('');
        fetchComments();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
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

  return (
    <section style={{ marginTop: 'var(--sp-8)' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--ink-100)', marginBottom: 'var(--sp-6)' }}>
        Responses ({comments.length})
      </h2>

      {/* Comment input */}
      {user ? (
        <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-8)', alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--navy-700), var(--navy-900))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'var(--brass-400)',
            flexShrink: 0, marginTop: 2
          }}>
            {getInitials(user.name)}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              rows={3}
              style={{
                width: '100%', padding: 'var(--sp-3) var(--sp-4)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--ink-100)', fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-sans)', resize: 'vertical',
                lineHeight: 'var(--leading-relaxed)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
              <button
                onClick={handleSubmit}
                disabled={!commentText.trim() || submitting}
                style={{
                  padding: '8px 20px',
                  background: commentText.trim() && !submitting ? 'var(--brass-500)' : 'var(--ink-700)',
                  border: 'none', borderRadius: 'var(--radius-full)',
                  color: commentText.trim() && !submitting ? '#060A16' : 'var(--ink-500)',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                  cursor: commentText.trim() && !submitting ? 'pointer' : 'default',
                  fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Posting...' : 'Respond'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: 'var(--sp-5)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center', marginBottom: 'var(--sp-8)',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', marginBottom: 'var(--sp-3)' }}>
            Sign in to join the conversation
          </p>
          <a
            href={`/community/login?redirect=/community/${articleSlug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
              color: '#060A16', border: '1px solid #CEAE56',
              borderRadius: '0.5rem', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In / Register to Comment
          </a>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--ink-500)', fontSize: 'var(--text-sm)' }}>
          Loading comments...
        </div>
      )}

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--navy-700), var(--navy-900))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'var(--brass-400)', flexShrink: 0,
            }}>
              {getInitials(c.user_name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', marginBottom: 'var(--sp-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-200)' }}>{c.user_name}</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-600)' }}>·</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>{formatDate(c.created_at)}</span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)' }}>{c.body}</p>
              <div style={{ marginTop: 'var(--sp-2)', fontSize: '11px', color: 'var(--ink-500)' }}>
                ♡ {c.likes}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && comments.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--ink-500)', fontSize: 'var(--text-sm)' }}>
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </section>
  );
}
