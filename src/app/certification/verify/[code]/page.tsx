// Public, unauthenticated, server-rendered credential verification page
// No PlatformNav, no sidebar, no authenticated shell
// Accessible to employers, regulators, and any external party
import Link from 'next/link';
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
    color: '#CEAE56',
    glow: 'rgba(184,150,46,0.30)',
    border: 'rgba(184,150,46,0.45)',
    emoji: '🏆',
    bg: 'rgba(184,150,46,0.05)',
  },
  Proficiency: {
    color: '#C0C8D8',
    glow: 'rgba(192,200,216,0.20)',
    border: 'rgba(192,200,216,0.35)',
    emoji: '🎓',
    bg: 'rgba(192,200,216,0.04)',
  },
  Completion: {
    color: '#C89460',
    glow: 'rgba(173,124,72,0.20)',
    border: 'rgba(173,124,72,0.35)',
    emoji: '📜',
    bg: 'rgba(173,124,72,0.04)',
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

  const verificationUrl = `https://fingeniQ.in/certification/verify/${code}`;
  const tm = learner ? TIER_META[learner.tier] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060A16',
      color: '#E6EDF6',
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>

      {/* Brand Header */}
      <header role="banner" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #183070, #050F24)',
            border: '1px solid rgba(184,150,46,0.35)',
            borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem',
            fontFamily: 'Georgia, serif',
            color: '#CEAE56',
          }}>
            F
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#E6EDF6', letterSpacing: '-0.02em' }}>
            Fingen<span style={{ color: '#B8962E' }}>IQ</span>
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#566078', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
            boxShadow: `0 0 60px ${tm.glow}, 0 0 120px rgba(0,0,0,0.6)`,
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
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.30)',
            borderRadius: '9999px',
            width: 'fit-content',
            margin: '0 auto 2rem',
          }} role="status" aria-label="Credential verified">
            <span style={{ color: '#34D399', fontSize: '0.9rem' }} aria-hidden="true">✓</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34D399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Verified Authentic Credential
            </span>
          </div>

          {/* Tier Seal */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{ fontSize: '3.5rem', marginBottom: '0.75rem', filter: `drop-shadow(0 0 12px ${tm.glow})` }}
              role="img"
              aria-label={`${learner.tier} tier award`}
            >
              {tm.emoji}
            </div>
            <h1
              id="cert-title"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                color: tm.color,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.5rem',
              }}
            >
              {learner.tier} Certificate
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#566078', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              FingenIQ Financial Education Program
            </p>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tm.border}, transparent)`, margin: '1.5rem 0' }} aria-hidden="true" />

          {/* Learner Details */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#566078', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Awarded to
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#E8EEF8', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>
              {learner.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#566078' }}>
              Issued <time dateTime={learner.issueDate}>{learner.issueDate}</time>
            </div>
          </div>

          {/* Score and Tracks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#566078', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Weighted Score
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.75rem', fontWeight: 700, color: tm.color, fontVariantNumeric: 'tabular-nums' }}>
                {learner.score.toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#566078', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Professional Tracks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {learner.tracks.map(t => (
                  <div key={t} style={{ fontSize: '0.7rem', color: '#A6B3C6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: '#34D399' }} aria-hidden="true">✓</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capstone */}
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#566078', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Capstone Project
            </div>
            <div style={{ fontSize: '0.8rem', color: '#C4D0E0', lineHeight: 1.5 }}>
              {learner.capstoneTitle}
            </div>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tm.border}, transparent)`, margin: '1.5rem 0' }} aria-hidden="true" />

          {/* Verification Code and QR placeholder */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#566078', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Verification Code
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 600, color: tm.color, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                {code}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#3A4760', wordBreak: 'break-all' }}>
                {verificationUrl}
              </div>
            </div>
            {/* QR Code placeholder */}
            <div
              style={{ width: 80, height: 80, background: '#0C1628', border: `1px solid ${tm.border}`, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              role="img"
              aria-label="QR code linking to this verification page"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, padding: 8 }}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} style={{ width: 14, height: 14, background: [0,2,6,8].includes(i) ? tm.color : i === 4 ? 'transparent' : '#1A2840', borderRadius: 2 }} />
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
            background: 'rgba(244,63,94,0.05)',
            border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">⚠️</div>
          <h1 id="invalid-title" style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#E6EDF6', marginBottom: '0.75rem' }}>
            Credential Not Found
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#566078', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            The verification code <code style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 4, color: '#9AAABF', fontSize: '0.8rem' }}>{code}</code> does not match any issued FingenIQ credential.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#3A4760', lineHeight: 1.65 }}>
            If you believe this is an error, please contact the credential holder directly or reach us at credentials@fingeniQ.in
          </p>
        </main>
      )}

      {/* Footer Disclaimer */}
      <footer role="contentinfo" style={{ marginTop: '2.5rem', textAlign: 'center', maxWidth: 600 }}>
        <p style={{ fontSize: '0.65rem', color: '#2A3449', lineHeight: 1.65 }}>
          This credential is issued by FingenIQ, an educational platform. It does not constitute a regulated qualification, SEBI registration, or IRDA, AMFI, or any other regulatory licence. This is for educational achievement recognition only.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.7rem', color: '#3A4760', textDecoration: 'none' }}>
          ← Return to FingenIQ
        </Link>
      </footer>
    </div>
  );
}
