'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { MODULES, LESSONS } from '@/lib/data';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { fetchUserProgress } from '@/app/actions/progressActions';

const MODULE_COLORS = [
  'var(--sapphire-500)', 'var(--brass-500)', 'var(--emerald-500)',
  'var(--amber-500)', 'var(--rose-400)', 'var(--sapphire-400)',
  'var(--emerald-400)', 'var(--brass-400)',
];

export default function Lessons() {
  const [search, setSearch] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [collapsedModules, setCollapsedModules] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchUserProgress().then(res => {
      if (res.success && res.progressMap) {
        setProgressMap(res.progressMap);
      }
    });
  }, []);

  const dynamicLessons = useMemo(() => {
    return LESSONS.map(l => ({
      ...l,
      status: progressMap[l.id]?.status ?? 'not-started',
      score: progressMap[l.id]?.score ?? null,
    }));
  }, [progressMap]);

  const toggleCollapse = (id: string) =>
    setCollapsedModules(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleModule = (id: string) =>
    setSelectedModules(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleStatus = (s: string) =>
    setSelectedStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const clearAll = () => { setSelectedModules([]); setSelectedStatuses([]); setSearch(''); };

  const filteredLessons = useMemo(() => dynamicLessons.filter(l => {
    const searchMatch = !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const moduleMatch = selectedModules.length === 0 || selectedModules.includes(l.moduleId);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(l.status);
    return searchMatch && moduleMatch && statusMatch;
  }), [search, selectedModules, selectedStatuses, dynamicLessons]);

  const hasFilters = selectedModules.length > 0 || selectedStatuses.length > 0 || search;

  const STATUS_META: Record<string, { label: string; badge: string }> = {
    completed:   { label: 'Completed',   badge: 'badge--completed' },
    'in-progress':{ label: 'In Progress', badge: 'badge--in-progress' },
    'not-started':{ label: 'Not Started', badge: 'badge--not-started' },
    locked:      { label: 'Locked',       badge: 'badge--locked' },
  };

  return (
    <div className="platform">
      <PlatformNav />

      <div className="page-wrapper">
        <main className="page-main">
          <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>

            {/* Page Header */}
            <div className="animate-fadeUp" style={{ marginBottom: 'var(--sp-10)' }}>
              <div className="page-hero__label">Curriculum</div>
              <h1 className="page-hero__title">Lesson Library</h1>
              <p className="page-hero__subtitle">
                44 lessons across 8 modules — from Foundations of Money to Financial Leadership.
                Structured sequentially with prerequisite gating for academic integrity.
              </p>
            </div>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '260px 1fr' }}>

              {/* Filter Sidebar */}
              <aside className="dashboard-sidebar animate-fadeUp" aria-label="Lesson filters">
                <div className="card p-6">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-5)' }}>
                    <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontFamily: 'var(--font-sans)' }}>
                      Filter Lessons
                    </h2>
                    {hasFilters && (
                      <button className="btn btn--ghost btn--xs" onClick={clearAll} style={{ color: 'var(--rose-400)', fontSize: 'var(--text-2xs)' }}>
                        Clear All ×
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
                    <div className="form-input-wrap">
                      <span className="form-input-icon" aria-hidden="true">🔍</span>
                      <input
                        type="search"
                        className="form-input"
                        placeholder="Search lessons, tags..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        aria-label="Search lessons"
                      />
                    </div>
                  </div>

                  {/* Module Filter */}
                  <div style={{ marginBottom: 'var(--sp-6)' }}>
                    <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--sp-3)' }}>
                      By Module
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      {MODULES.map((m, i) => (
                        <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--ink-300)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            className="filter-checkbox"
                            checked={selectedModules.includes(m.id)}
                            onChange={() => toggleModule(m.id)}
                            aria-label={`Filter by Module ${m.order}: ${m.title}`}
                          />
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: MODULE_COLORS[i], flexShrink: 0 }} aria-hidden="true" />
                          <span>M{m.order} — {m.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--sp-3)' }}>
                      By Status
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      {(['completed', 'in-progress', 'not-started', 'locked'] as const).map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--ink-300)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            className="filter-checkbox"
                            checked={selectedStatuses.includes(s)}
                            onChange={() => toggleStatus(s)}
                            aria-label={`Filter by ${STATUS_META[s].label} status`}
                          />
                          <span>{STATUS_META[s].label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Count */}
                  <div style={{ marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-4)', borderTop: 'var(--border-subtle)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Showing</span>
                    <span className="num" style={{ color: 'var(--ink-200)', fontWeight: 600 }}>{filteredLessons.length} / {LESSONS.length}</span>
                  </div>
                </div>
              </aside>

              {/* Lesson Grid */}
              <div className="dashboard-main animate-fadeUp delay-100">

                {/* Empty State */}
                {filteredLessons.length === 0 && (
                  <div className="card">
                    <div className="empty-state" role="alert">
                      <div className="empty-state__icon" aria-hidden="true">📭</div>
                      <div className="empty-state__title">No lessons match your filters</div>
                      <p className="empty-state__desc">Try adjusting your search term or clearing the module and status filters.</p>
                      <button className="btn btn--outline btn--sm" onClick={clearAll} style={{ marginTop: 'var(--sp-2)' }}>
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}

                {/* Module Groups */}
                {MODULES.filter(m => selectedModules.length === 0 || selectedModules.includes(m.id)).map((m, mi) => {
                  const mLessons = filteredLessons.filter(l => l.moduleId === m.id);
                  if (mLessons.length === 0) return null;
                  const isCollapsed = collapsedModules.includes(m.id);
                  const completedCount = mLessons.filter(l => l.status === 'completed').length;
                  const pct = Math.round((completedCount / mLessons.length) * 100);
                  const color = MODULE_COLORS[mi];

                  return (
                    <div key={m.id} className="module-card" role="region" aria-labelledby={`module-${m.id}-heading`}>
                      {/* Module Header */}
                      <div
                        className="module-card__header"
                        onClick={() => toggleCollapse(m.id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={!isCollapsed}
                        aria-controls={`module-${m.id}-body`}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleCollapse(m.id)}
                      >
                        <div className="module-card__title-area">
                          <div
                            style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0 }}
                            aria-hidden="true"
                          >
                            {m.icon}
                          </div>
                          <div className="module-card__info">
                            <h3 id={`module-${m.id}-heading`}>Module {m.order} — {m.title}</h3>
                            <p>{mLessons.length} lesson{mLessons.length !== 1 ? 's' : ''} · {m.subtitle}</p>
                          </div>
                        </div>
                        <div className="module-card__meta">
                          <div className="module-card__progress" aria-label={`${pct}% complete`}>
                            <div className="module-card__progress-bar">
                              <div className="module-card__progress-fill" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="num" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginLeft: 'var(--sp-4)' }} aria-hidden="true">
                            {isCollapsed ? '▽' : '△'}
                          </span>
                        </div>
                      </div>

                      {/* Lesson Cards Grid */}
                      {!isCollapsed && (
                        <div id={`module-${m.id}-body`} className="module-card__body">
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-5)' }}>
                            {mLessons.map(l => (
                              <div key={l.id} className="lesson-card" role="article" aria-label={`Lesson ${l.order}: ${l.title}, ${l.status}`} style={{ '--lesson-color': color } as React.CSSProperties}>
                                <div className="lesson-card__header" aria-hidden="true" />
                                <div className="lesson-card__body">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                                    <span className="lesson-card__id num">L{String(l.order).padStart(2, '0')}</span>
                                    <span className={`badge ${STATUS_META[l.status]?.badge ?? 'badge--not-started'}`}>
                                      {STATUS_META[l.status]?.label ?? l.status}
                                    </span>
                                  </div>
                                  <h4 className="lesson-card__title">{l.title}</h4>
                                  <p className="lesson-card__desc">{l.description}</p>
                                </div>
                                <div className="lesson-card__footer">
                                  <span className="lesson-card__duration" aria-label={`Duration: ${l.duration} minutes`}>🕒 {l.duration} min</span>
                                  {l.status !== 'locked' ? (
                                    <Link
                                      href={`/lesson-player/${l.id}`}
                                      className="btn btn--primary btn--xs"
                                      aria-label={`Start lesson: ${l.title}`}
                                    >
                                      {l.status === 'completed' ? 'Re-Master' : l.status === 'in-progress' ? 'Continue →' : 'Start →'}
                                    </Link>
                                  ) : (
                                    <span
                                      style={{ fontSize: 'var(--text-xs)', color: 'var(--rose-400)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}
                                      role="img"
                                      aria-label="Locked — prerequisite not met"
                                    >
                                      🔒 Locked
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
