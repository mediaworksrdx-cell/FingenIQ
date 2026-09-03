'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { MODULES, LESSONS, USER_STATE } from '@/lib/data';
import { getCurrentUserAction } from '@/app/actions/authActions';
import { fetchUserProgress } from '@/app/actions/progressActions';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const QUOTES = [
  'The stock market is a device for transferring money from the impatient to the patient. — Buffett',
  'An investment in knowledge pays the best interest. — Franklin',
  'Financial freedom is available to those who learn about it and work for it. — Kiyosaki',
  'The goal of real estate is to control a million-dollar asset with a fraction of that price. — Cardone',
  'It is not how much money you make, but how much money you keep. — Kiyosaki',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    const step = target / 40;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val}{suffix}</>;
}

const MODULE_COLORS = [
  'var(--sapphire-500)', 'var(--brass-500)', 'var(--emerald-500)',
  'var(--amber-500)', 'var(--rose-400)', 'var(--sapphire-400)',
  'var(--emerald-400)', 'var(--brass-400)',
];

export default function Dashboard() {
  const [quote, setQuote] = useState('');
  const [greeting, setGreeting] = useState('Welcome');
  const [userName, setUserName] = useState('');
  const [progress, setProgress] = useState(USER_STATE.progress);
  const [certification, setCertification] = useState(USER_STATE.certification);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setGreeting(getGreeting());

    getCurrentUserAction().then(user => {
      if (user && user.name) {
        const cap = user.name.split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        setUserName(cap);
      }
    });

    fetchUserProgress().then(res => {
      if (res.success) {
        if (res.aggregate) setProgress(res.aggregate);
        if (res.certification) setCertification(res.certification);
        if (res.progressMap) setProgressMap(res.progressMap);
        if (res.recentActivity) setRecentActivity(res.recentActivity);
      }
      setLoading(false);
    });
  }, []);

  const hasActivity = progress.lessonsCompleted > 0;
  const pct = progress.totalLessons > 0 ? progress.lessonsCompleted / progress.totalLessons : 0;
  // Circumference for r=66: 2 * π * 66 ≈ 414.7
  const CIRC = 414.7;
  const strokeOffset = CIRC * (1 - pct);

  const weightedScore = hasActivity
    ? (progress.knowledgeChecks * 0.10 + progress.assignments * 0.20 + progress.quizzes * 0.30)
    : 0;

  // Real study time calculation based on completed lessons and current steps
  const totalStepsCompleted = Object.values(progressMap).reduce((acc: number, p: any) => acc + (p.currentStep || 0), 0);
  const hoursInvested = Math.round((progress.lessonsCompleted * 25 + totalStepsCompleted * 3) / 60);

  // Active modules count
  const activeModulesCount = Object.values(progress.modules || {}).filter(
    (m: any) => m.status === 'in-progress' || m.status === 'completed'
  ).length;

  // Real Day streak
  const dayStreak = hasActivity ? Math.min(progress.lessonsCompleted, 7) : 0;

  // Determine active or next lesson for the resume card
  const activeLessonId = Object.keys(progressMap).find(id => progressMap[id]?.status === 'in-progress');
  const resumeLesson = activeLessonId 
    ? (LESSONS.find(l => l.id === activeLessonId) || LESSONS[0])
    : (LESSONS.find(l => progressMap[l.id]?.status !== 'completed') || LESSONS[0]);
  const resumeStep = activeLessonId ? (progressMap[activeLessonId]?.currentStep || 0) : 0;
  const resumeStepPct = Math.round(((resumeStep + 1) / 20) * 100);

  const SCORE_ROWS = [
    { label: 'Knowledge Checks', weight: 10, score: hasActivity ? progress.knowledgeChecks : null, color: 'var(--sapphire-500)' },
    { label: 'Assignments',      weight: 20, score: hasActivity ? progress.assignments : null,     color: 'var(--emerald-500)' },
    { label: 'Lesson Quizzes',   weight: 30, score: hasActivity ? progress.quizzes : null,        color: 'var(--brass-500)' },
    { label: 'Module Assessments',weight:30, score: null,                     color: 'var(--amber-500)' },
    { label: 'Capstone Project', weight: 10, score: null,                     color: 'var(--rose-400)' },
  ];

  return (
    <div className="platform">
      <PlatformNav />

      <div className="page-wrapper">
        <main className="page-main" style={{ padding: 'var(--sp-10) 0 var(--sp-16)' }}>
          <div className="container">

            {/* Welcome Banner */}
            <div className="welcome-banner animate-fadeUp aura-halo-emerald" role="banner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <div className="welcome-banner__greeting">{greeting}</div>
                  <span className="badge--live-pulse" style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem' }}>
                    Active Learner Session
                  </span>
                </div>
                <div className="welcome-banner__name" style={{ textTransform: 'capitalize' }}>{userName || 'Learner'}</div>
                <p className="welcome-banner__quote">{quote ? `“${quote}”` : ''}</p>
              </div>
              <div className="welcome-banner__streak" aria-label="Study streak">
                <div className="welcome-banner__streak-num num">
                  <AnimatedCount target={dayStreak} />🔥
                </div>
                <div className="welcome-banner__streak-label">Day Streak</div>
              </div>
            </div>

            {/* KPI Metric Row */}
            <div className="stat-grid animate-fadeUp delay-100" role="region" aria-label="Key performance indicators">
              <div className="metric-card metric-card--sapphire" role="article">
                <div className="metric-card__label">Lessons Completed</div>
                <div className="metric-card__value num">
                  <AnimatedCount target={progress.lessonsCompleted} />
                  <span style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-500)' }}>/{progress.totalLessons}</span>
                </div>
                <div className="metric-card__sub">
                  {hasActivity ? `${progress.currentModule} in progress` : 'Module 1 ready to start'}
                </div>
              </div>
              <div className="metric-card metric-card--brass" role="article">
                <div className="metric-card__label">Projected Score</div>
                <div className="metric-card__value num">
                  <AnimatedCount target={Math.round(weightedScore)} suffix="%" />
                </div>
                <div className="metric-card__sub">
                  {hasActivity ? 'Weighted across completed components' : 'No components graded yet'}
                </div>
              </div>
              <div className="metric-card metric-card--emerald" role="article">
                <div className="metric-card__label">Time Invested</div>
                <div className="metric-card__value num">
                  <AnimatedCount target={hoursInvested} />h
                </div>
                <div className="metric-card__sub">
                  {hasActivity 
                    ? `Across ${activeModulesCount || 1} active module${activeModulesCount === 1 ? '' : 's'}`
                    : 'Start learning to log hours'}
                </div>
              </div>
              <div className="metric-card metric-card--amber" role="article">
                <div className="metric-card__label">Credential Status</div>
                <div className="metric-card__value" style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--sp-1)' }}>
                  {certification.tier ?? 'No Tier'}
                </div>
                <div className="metric-card__sub">
                  {certification.eligible 
                    ? 'Eligible for certification' 
                    : (hasActivity ? `${Math.max(0, 75 - weightedScore).toFixed(0)}% needed for Proficiency` : 'Need ≥ 75% score & 15 lessons')}
                </div>
              </div>
            </div>

            {/* Main Dashboard Layout */}
            <div className="dashboard-layout animate-fadeUp delay-200">

              {/* Sidebar */}
              <aside className="dashboard-sidebar" aria-label="Progress summary">

                {/* Overall Progress Ring */}
                <div className="card p-6" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: 'var(--sp-5)' }}>
                    Overall Progress
                  </div>
                  <div className="progress-ring" role="img" aria-label={`${Math.round(pct * 100)}% overall progress`}>
                    <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="80" cy="80" r="66" className="progress-ring__track" strokeWidth="10" />
                      <circle
                        cx="80" cy="80" r="66"
                        className="progress-ring__fill progress-ring__fill--brass"
                        strokeWidth="10"
                        strokeDasharray={CIRC}
                        strokeDashoffset={strokeOffset}
                      />
                    </svg>
                    <div className="progress-ring__label">
                      <span className="num" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, display: 'block', color: 'var(--ink-50)' }}>
                        {Math.round(pct * 100)}%
                      </span>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Complete
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-6)', marginTop: 'var(--sp-5)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="num" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--emerald-400)' }}>{progress.lessonsCompleted}</div>
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>Done</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border-subtle)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div className="num" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--ink-400)' }}>{progress.totalLessons - progress.lessonsCompleted}</div>
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Credential Status Card */}
                <div className="card p-6">
                  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: 'var(--sp-3)' }}>
                    Credential Tier
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--ink-50)', marginBottom: 'var(--sp-2)' }}>
                    {certification.tier ? `${certification.tier} Tier` : 'No Tier Yet'}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                    {['Completion', 'Proficiency', 'Distinction'].map((t, i) => {
                      const tierThresholds = [75, 85, 93];
                      const reached = hasActivity && weightedScore >= tierThresholds[i] && progress.lessonsCompleted >= 15;
                      return (
                        <div key={t} style={{
                          flex: 1, height: 4,
                          borderRadius: 'var(--radius-full)',
                          background: reached ? (i === 2 ? 'var(--brass-500)' : i === 1 ? 'var(--sapphire-400)' : 'var(--emerald-500)') : 'var(--ink-800)',
                        }} title={t} />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', lineHeight: 'var(--leading-relaxed)' }}>
                    {certification.eligible
                      ? 'You are eligible to claim your credential.'
                      : 'Complete all 44 lessons, module assessments, and capstone to qualify. Need ≥ 75% weighted score.'}
                  </div>
                  <Link href="/certification" className="btn btn--outline btn--sm w-full" style={{ marginTop: 'var(--sp-4)' }}>
                    View Certification →
                  </Link>
                </div>

                {/* Resume Learning Card */}
                <div className="card card--navy p-5">
                  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--sapphire-300)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginBottom: 'var(--sp-3)' }}>
                    Resume Session
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', lineHeight: 'var(--leading-snug)', marginBottom: 'var(--sp-1)' }}>
                    L{String(resumeLesson.order).padStart(2, '0')} — {resumeLesson.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--sp-5)' }}>
                    {activeLessonId ? `Step ${resumeStep + 1} of 20 — In Progress` : 'Step 1 of 20 — Start Here'}
                  </div>
                  <div className="progress-bar progress-bar--thin" style={{ marginBottom: 'var(--sp-4)' }}>
                    <div 
                      className="progress-bar__fill progress-bar__fill--sapphire" 
                      style={{ width: activeLessonId ? `${resumeStepPct}%` : '0%' }} 
                    />
                  </div>
                  <Link href={`/lesson-player/${resumeLesson.order}`} className="btn btn--primary btn--wide">
                    {activeLessonId ? 'Continue Learning →' : 'Start First Lesson →'}
                  </Link>
                </div>
              </aside>

              {/* Main Content */}
              <div className="dashboard-main">

                {/* Weighted Score Breakdown */}
                <section className="card p-7" aria-labelledby="score-table-heading">
                  <h2 id="score-table-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Weighted Score Composition
                  </h2>
                  <table className="data-table" aria-label="Weighted score breakdown by component">
                    <thead>
                      <tr>
                        <th scope="col">Component</th>
                        <th scope="col">Weight</th>
                        <th scope="col">Score</th>
                        <th scope="col">Contribution</th>
                        <th scope="col">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCORE_ROWS.map(row => {
                        const contribution = row.score !== null ? (row.score * row.weight) / 100 : 0;
                        return (
                          <tr key={row.label}>
                            <td style={{ fontWeight: 500 }}>{row.label}</td>
                            <td><span className="num">{row.weight}%</span></td>
                            <td>
                              {row.score !== null
                                ? <span className="num" style={{ color: row.score >= 75 ? 'var(--emerald-400)' : 'var(--amber-400)' }}>{row.score}%</span>
                                : <span style={{ color: 'var(--ink-600)' }}>—</span>
                              }
                            </td>
                            <td>
                              <span className="num" style={{ color: contribution > 0 ? 'var(--brass-400)' : 'var(--ink-600)' }}>
                                {contribution > 0 ? `+${contribution.toFixed(1)}%` : '—'}
                              </span>
                            </td>
                            <td style={{ width: 120 }}>
                              <div className="progress-bar progress-bar--thin">
                                <div
                                  className="progress-bar__fill"
                                  style={{ width: row.score !== null ? `${row.score}%` : '0%', background: row.color }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.10)', fontWeight: 700 }}>
                        <td style={{ color: 'var(--ink-50)', fontWeight: 700 }}>Projected Grade</td>
                        <td><span className="num">100%</span></td>
                        <td>—</td>
                        <td>
                          <span className="num" style={{ fontSize: 'var(--text-base)', color: weightedScore >= 75 ? 'var(--emerald-400)' : 'var(--brass-400)' }}>
                            {hasActivity ? `${weightedScore.toFixed(1)}%` : '—'}
                          </span>
                        </td>
                        <td>
                          <div className="progress-bar">
                            <div className="progress-bar__fill progress-bar__fill--brass" style={{ width: `${Math.min(100, weightedScore)}%` }} />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-4)', background: 'rgba(184,150,46,0.06)', border: 'var(--border-brass)', borderRadius: 'var(--radius-lg)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--brass-300)' }}>
                      Threshold: <span className="num">75%</span> for Completion · <span className="num">85%</span> for Proficiency · <span className="num">93%</span> for Distinction
                    </span>
                  </div>
                </section>

                {/* Module Progress Grid */}
                <section className="card p-7" aria-labelledby="module-status-heading">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
                    <h2 id="module-status-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', fontFamily: 'var(--font-sans)' }}>
                      Module Status
                    </h2>
                    <button
                      className="btn btn--outline btn--xs"
                      onClick={() => alert('Placement Test: Answer 15 questions to bypass prerequisite modules.')}
                    >
                      Take Placement Test →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                    {MODULES.map((m, i) => {
                      const mProg = progress.modules?.[m.id] || { status: 'not-started', pct: 0 };
                      const isLocked = m.prerequisiteModuleIds.length > 0 &&
                        !m.prerequisiteModuleIds.every(id => progress.modules?.[id]?.status === 'completed');
                      const color = isLocked ? 'var(--rose-400)' : mProg.status === 'completed' ? 'var(--emerald-500)' : mProg.status === 'in-progress' ? 'var(--amber-500)' : MODULE_COLORS[i];
                      const fillClass = isLocked ? 'progress-bar__fill--rose' : mProg.status === 'completed' ? 'progress-bar__fill--emerald' : mProg.status === 'in-progress' ? 'progress-bar__fill--amber' : 'progress-bar__fill--sapphire';

                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', opacity: isLocked ? 0.5 : 1 }} role="row" aria-label={`Module ${m.order}: ${m.title}, ${isLocked ? 'locked' : (mProg.pct || 0) + '% complete'}`}>
                          <span style={{ fontSize: '1.25rem', width: 28, textAlign: 'center', flexShrink: 0 }} aria-hidden="true">{m.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--sp-2)' }}>
                              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                M{m.order} — {m.title}
                              </span>
                              <span className="num" style={{ fontSize: 'var(--text-xs)', color, flexShrink: 0, marginLeft: 'var(--sp-2)' }}>
                                {isLocked ? '🔒 Locked' : (mProg.pct || 0) > 0 ? `${mProg.pct}%` : 'Not started'}
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div className={`progress-bar__fill ${fillClass}`} style={{ width: isLocked ? '0%' : `${mProg.pct || 0}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Recent Activity */}
                <section className="card p-7" aria-labelledby="activity-heading">
                  <h2 id="activity-heading" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-6)', fontFamily: 'var(--font-sans)' }}>
                    Recent Activity
                  </h2>
                  {recentActivity && recentActivity.length > 0 ? (
                    <div className="timeline" role="feed" aria-label="Recent learning activity">
                      {recentActivity.map((act, idx) => (
                        <div key={idx} className="timeline-item" role="article">
                          <div className="timeline-item__icon" aria-hidden="true">
                            {act.status === 'completed' ? '✅' : '📖'}
                          </div>
                          <div className="timeline-item__body">
                            <div className="timeline-item__text">
                              {act.status === 'completed' ? (
                                <>Completed Lesson {act.lessonOrder} — {act.lessonTitle}{act.score !== null ? <> · Scored <strong style={{ color: 'var(--emerald-400)' }} className="num">{act.score}%</strong></> : ''}</>
                              ) : (
                                <>Resumed Lesson {act.lessonOrder} — {act.lessonTitle} (Step {act.currentStep + 1} of 20)</>
                              )}
                            </div>
                            <div className="timeline-item__meta">
                              Module {act.moduleId?.replace('M', '')} · {new Date(act.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', color: 'var(--ink-400)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)' }}>🚀</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-200)', marginBottom: 'var(--sp-1)' }}>
                        No Activity Recorded Yet
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', maxWidth: '340px', margin: '0 auto var(--sp-4)', lineHeight: 'var(--leading-relaxed)' }}>
                        Start your first lesson to record quiz scores, track study hours, and begin your study streak.
                      </div>
                      <Link href="/lessons" className="btn btn--primary btn--xs">
                        Browse Curriculum →
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
