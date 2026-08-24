// Public, unauthenticated, server-rendered credential verification page
// No PlatformNav, no sidebar, no authenticated shell
// Accessible to employers, regulators, and any external party
import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';
import { db } from '@/lib/db';
import { PROFESSIONAL_TRACKS } from '@/lib/data';

// Mock learner data keyed by verification code
const LEARNER_DB: Record<string, {
  name: string;
  tier: 'Distinction' | 'Proficiency' | 'Completion';
  issueDate: string;
  tracks: string[];
  score: number;
  capstoneTitle: string;
}> = {
  'FGIQ-2026-AM001': {
    name: 'Arjun Mehta',
    tier: 'Proficiency',
    issueDate: '15 June 2026',
    tracks: ['Equity Research Analyst Certification', 'Banking Professional Certification'],
    score: 86.4,
    capstoneTitle: 'Tata Consultancy Services — DCF Valuation & Investment Thesis',
  },
  'FGIQ-2026-PS002': {
    name: 'Priya Sharma',
    tier: 'Distinction',
    issueDate: '3 July 2026',
    tracks: ['Equity Research Analyst Certification', 'Corporate Finance Professional Certification'],
    score: 94.1,
    capstoneTitle: 'Reliance Industries Post-Jio Capital Restructuring Analysis',
  },
};

const TIER_META: Record<string, { color: string; glow: string; border: string; emoji: string; bg: string }> = {
  Distinction: {
    color: '#B45309',
    glow: 'rgba(180, 83, 9, 0.15)',
    border: 'rgba(180, 83, 9, 0.35)',
    emoji: '🏆',
    bg: '#FFFFFF',
  },
  Proficiency: {
    color: '#15803D',
    glow: 'rgba(21, 128, 61, 0.15)',
    border: 'rgba(21, 128, 61, 0.35)',
    emoji: '🎓',
    bg: '#FFFFFF',
  },
  Completion: {
    color: '#334155',
    glow: 'rgba(51, 65, 85, 0.15)',
    border: 'rgba(51, 65, 85, 0.35)',
    emoji: '📜',
    bg: '#FFFFFF',
  },
};

export default async function VerifyCredential({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  
  // 1. Try to find in DB
  let learner = null;
  const dbCert = db.prepare(`
    SELECT c.id, c.trackId, c.issuedAt, c.certificateHash, u.name as userName
    FROM user_certifications c
    JOIN users u ON c.userId = u.id
    WHERE c.certificateHash = ?
  `).get(code) as any;

  if (dbCert) {
    const track = PROFESSIONAL_TRACKS.find(t => t.id === dbCert.trackId);
    learner = {
      name: dbCert.userName,
      tier: 'Proficiency' as const,
      issueDate: new Date(dbCert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      tracks: [track ? track.name : dbCert.trackId],
      score: 85.0,
      capstoneTitle: 'FingenIQ Professional Milestone Assessment & Case Study Verification',
    };
  } else {
    // 2. Fallback to mock DB
    learner = LEARNER_DB[code];
  }

  const verificationUrl = `https://fingeniq.com/certification/verify/${code}`;
  const tm = learner ? TIER_META[learner.tier] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F5',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(22, 163, 74, 0.06) 0%, transparent 60%), #FAF8F5',
      color: '#0F172A',
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>

      {/* Brand Header */}
      <header role="banner" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <FinGenIqLogo showText={true} size={42} />
        </Link>
        <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Credential Verification System
        </p>
      </header>

      {learner && tm ? (
        <main
          role="main"
          aria-labelledby="cert-title"
          style={{
            width: '100%',
            maxWidth: 680,
            background: tm.bg,
            border: `2px solid ${tm.border}`,
            borderRadius: '1.5rem',
            padding: '3rem 3.5rem',
            boxShadow: `0 10px 40px rgba(0, 0, 0, 0.08), 0 0 30px ${tm.glow}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner decorative borders */}
          <div style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderTop: `2px solid ${tm.color}`, borderLeft: `2px solid ${tm.color}`, borderRadius: '4px 0 0 0', opacity: 0.5 }} aria-hidden="true" />
          <div style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderTop: `2px solid ${tm.color}`, borderRight: `2px solid ${tm.color}`, borderRadius: '0 4px 0 0', opacity: 0.5 }} aria-hidden="true" />
          <div style={{ position: 'absolute', bottom: 16, left: 16, width: 40, height: 40, borderBottom: `2px solid ${tm.color}`, borderLeft: `2px solid ${tm.color}`, borderRadius: '0 0 0 4px', opacity: 0.5 }} aria-hidden="true" />
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 40, height: 40, borderBottom: `2px solid ${tm.color}`, borderRight: `2px solid ${tm.color}`, borderRadius: '0 0 4px 0', opacity: 0.5 }} aria-hidden="true" />

          {/* Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            padding: '0.5rem 1.25rem',
            background: 'rgba(22, 163, 74, 0.1)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            borderRadius: '9999px',
            width: 'fit-content',
            margin: '0 auto 2rem',
          }} role="status" aria-label="Credential verified">
            <span style={{ color: '#15803D', fontSize: '0.9rem', fontWeight: 700 }} aria-hidden="true">✓</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Verified Authentic Credential
            </span>
          </div>

          {/* Tier Seal */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}
              role="img"
              aria-label={`${learner.tier} tier award`}
            >
              {tm.emoji}
            </div>
            <h1
              id="cert-title"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                color: tm.color,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.5rem',
                fontWeight: 700,
              }}
            >
              {learner.tier} Certificate
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              FingenIQ Financial Education Program
            </p>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tm.border}, transparent)`, margin: '1.5rem 0' }} aria-hidden="true" />

          {/* Learner Details */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Awarded to
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#0F172A', letterSpacing: '-0.01em', marginBottom: '0.25rem', fontWeight: 700 }}>
              {learner.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Issued <time dateTime={learner.issueDate}>{learner.issueDate}</time>
            </div>
          </div>

          {/* Score and Tracks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem', background: '#FAF8F5', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Weighted Score
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: tm.color, fontVariantNumeric: 'tabular-nums' }}>
                {learner.score.toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: '#FAF8F5', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Professional Tracks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {learner.tracks.map(t => (
                  <div key={t} style={{ fontSize: '0.75rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <span style={{ color: '#15803D', fontWeight: 700 }} aria-hidden="true">✓</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capstone */}
          <div style={{ padding: '1.25rem', background: '#FAF8F5', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Capstone Project
            </div>
            <div style={{ fontSize: '0.85rem', color: '#0F172A', lineHeight: 1.5, fontWeight: 500 }}>
              {learner.capstoneTitle}
            </div>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tm.border}, transparent)`, margin: '1.5rem 0' }} aria-hidden="true" />

          {/* Verification Code and QR placeholder */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Verification Code
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: tm.color, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                {code}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', wordBreak: 'break-all' }}>
                {verificationUrl}
              </div>
            </div>
            {/* QR Code placeholder */}
            <div
              style={{ width: 80, height: 80, background: '#FAF8F5', border: `1px solid ${tm.border}`, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              role="img"
              aria-label="QR code linking to this verification page"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, padding: 8 }}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} style={{ width: 14, height: 14, background: [0,2,6,8].includes(i) ? tm.color : i === 4 ? 'transparent' : '#CBD5E1', borderRadius: 2 }} />
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        // Not Found state
        <main
          role="main"
          aria-labelledby="invalid-title"
          style={{
            width: '100%',
            maxWidth: 480,
            background: '#FFFFFF',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">⚠️</div>
          <h1 id="invalid-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.75rem', fontWeight: 700 }}>
            Credential Not Found
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            The verification code <code style={{ background: '#FAF8F5', border: '1px solid rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: 4, color: '#0F172A', fontSize: '0.8rem' }}>{code}</code> does not match any issued FingenIQ credential.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.65 }}>
            If you believe this is an error, please contact the credential holder directly or reach us at info@fingeniq.com
          </p>
        </main>
      )}

      {/* Footer Disclaimer */}
      <footer role="contentinfo" style={{ marginTop: '2.5rem', textAlign: 'center', maxWidth: 600 }}>
        <p style={{ fontSize: '0.65rem', color: '#64748B', lineHeight: 1.65 }}>
          This credential is issued by FingenIQ, an independent educational technology platform. It does not constitute a statutory financial advisory license or regulatory authorization. This document certifies educational achievement recognition only.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.75rem', color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
          ← Return to FingenIQ
        </Link>
      </footer>
    </div>
  );
}
