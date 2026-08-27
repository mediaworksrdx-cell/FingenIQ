'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import { LESSON_STEPS, LESSONS, MODULES } from '@/lib/data';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchUserProgress, saveStepProgress, submitQuizScore } from '@/app/actions/progressActions';
import LessonGallery from '@/components/gallery/LessonGallery';
import dynamic from 'next/dynamic';

const FinancialNode3D = dynamic(() => import('@/components/3d/FinancialNode3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(184,150,46,0.2)' }}>
      <span style={{ fontSize: '13px', color: '#B8962E' }}>Loading 3D Visualizer...</span>
    </div>
  ),
});

const STEP_ICONS: Record<string, string> = {
  kc: '❓', quiz: '📝', 'ai-tutor': '🤖', concept: '📖',
  video: '▶', case: '📋', formula: '∑', overview: '📋',
  intro: '👋', objectives: '🎯', terminology: '🔤', visual: '📊',
  examples: '💡', casestudy: '📖', didyouknow: '✨', practice: '🛠️',
  summary: '📝', takeaways: '🔑', flashcards: '📇', assignment: '✍️',
  revision: '📚', next: '⏭️'
};

function formatTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function LessonPlayerComponent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const lessonId = params.id || 'L1';
  
  const [dynamicLesson, setDynamicLesson] = useState<any>(null);

  const lesson = useMemo(() => {
    if (dynamicLesson) return dynamicLesson;
    return LESSONS.find(l => l.id === lessonId) || LESSONS[0];
  }, [lessonId, dynamicLesson]);

  const module = useMemo(() => {
    return MODULES.find(m => m.id === lesson.moduleId) || MODULES[0];
  }, [lesson]);

  const [currentStep, setCurrentStep] = useState(0);
  const [gallerySlide, setGallerySlide] = useState(0);
  const stepFromGalleryRef = useRef(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.7' | 'aarka-2.0'>('gemini-3.7');
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string; time: string; model?: string }[]>([]);
  const [allowedModules, setAllowedModules] = useState<string[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const resetMessages = () => {
    const baseLesson = LESSONS.find(l => l.id === lessonId) || LESSONS[0];
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Hello! I am your AI Tutor for Lesson ${baseLesson.order}: ${baseLesson.title}.\n\nAsk me anything about this lesson or financial concepts!`,
        time: formatTime(),
        model: selectedModel,
      },
    ]);
  };

  useEffect(() => {
    // Fetch real-time lesson DB overrides
    fetch(`/api/lesson/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.lesson) {
          setDynamicLesson(data.lesson);
        }
      })
      .catch(() => {});

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.allowedModules) {
          setAllowedModules(data.allowedModules);
        } else {
          setAllowedModules(['ALL']);
        }
      })
      .catch(() => setAllowedModules(['ALL']));

    fetchUserProgress().then(res => {
      if (res.success && res.progressMap && res.progressMap[lessonId]) {
        const savedStep = res.progressMap[lessonId].currentStep || 0;
        setCurrentStep(savedStep >= LESSON_STEPS.length ? LESSON_STEPS.length - 1 : savedStep);
        if (res.progressMap[lessonId].score !== null) {
          setQuizScore(res.progressMap[lessonId].score);
        }
      }
    });

    resetMessages();
  }, [lessonId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStepChange = async (idx: number) => {
    setCurrentStep(idx);
    // Only sync gallery when the step change came from the step rail, not from gallery arrows
    if (!stepFromGalleryRef.current) {
      const images = lesson.galleryImages?.length ? lesson.galleryImages : [1, 2, 3];
      const totalSlides = images.length;
      const mapped = Math.min(
        Math.floor((idx / LESSON_STEPS.length) * totalSlides),
        totalSlides - 1
      );
      setGallerySlide(mapped);
    }
    stepFromGalleryRef.current = false;
    await saveStepProgress(lessonId, idx);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={idx} style={{ height: '0.4rem' }} />);
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-50)', margin: '0.6rem 0 0.25rem', borderBottom: '1px solid rgba(184,150,46,0.2)', paddingBottom: '0.2rem' }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brass-400)', margin: '0.5rem 0 0.2rem' }}>
            {trimmed.replace('#### ', '')}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('---')) {
        elements.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />);
        return;
      }

      let formatted: React.ReactNode = trimmed;
      if (trimmed.includes('**')) {
        const parts = trimmed.split('**');
        formatted = parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} style={{ color: 'var(--brass-300)', fontWeight: 700 }}>
              {part}
            </strong>
          ) : (
            part
          )
        );
      }

      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--ink-200)', lineHeight: 1.6, paddingLeft: '0.35rem' }}>
            <span style={{ color: 'var(--brass-400)', fontWeight: 700 }}>•</span>
            <div>{formatted}</div>
          </div>
        );
        return;
      }

      elements.push(
        <p key={idx} style={{ margin: '0.2rem 0', fontSize: '0.825rem', color: 'var(--ink-200)', lineHeight: 1.65 }}>
          {formatted}
        </p>
      );
    });

    return elements;
  };

  const sendAI = async (textOverride?: string) => {
    const text = (textOverride ?? aiInput).trim();
    if (!text || isTyping) return;

    const userMsgId = `u-${Date.now()}`;
    setMessages(p => [...p, { id: userMsgId, sender: 'user', text, time: formatTime() }]);
    if (!textOverride) setAiInput('');
    setIsTyping(true);

    try {
      const stepName = LESSON_STEPS[currentStep]?.name || 'Current Step';
      const contextualQuery = `Context: Lesson ${lesson.order}: ${lesson.title} (Step: ${stepName}). User question: ${text}`;
      
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextualQuery,
          query: contextualQuery,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      let reply = '';
      if (data.success && data.response) {
        reply = data.response;
      } else {
        reply = `For ${lesson.title}, remember that mastering these core financial disciplines is essential. Let me know if you need any clarification on this step!`;
      }
      const aiMsgId = `ai-${Date.now()}`;
      setMessages(p => [...p, { id: aiMsgId, sender: 'ai', text: reply, time: formatTime(), model: data.model || selectedModel }]);
    } catch {
      const errMsgId = `err-${Date.now()}`;
      setMessages(p => [
        ...p,
        {
          id: errMsgId,
          sender: 'ai',
          text: 'The AI Tutor reasoning engine is experiencing heavy load. Please ask your question again in a moment.',
          time: formatTime(),
          model: selectedModel,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (selectedRadio === null) return;
    const score = selectedRadio === 1 ? 100 : 0;
    setQuizScore(score);
    await submitQuizScore(lessonId, score);
  };

  const handleFinish = async () => {
    await submitQuizScore(lessonId, quizScore !== null ? quizScore : 85);
    router.push('/lessons');
  };

  const progressPct = Math.round(((currentStep + 1) / LESSON_STEPS.length) * 100);

  if (allowedModules && !allowedModules.includes('ALL') && !allowedModules.includes(module.id)) {
    return (
      <div className="platform" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <PlatformNav />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 'var(--nav-height)' }}>
          <div className="card p-8" style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>🔒</div>
            <h2 style={{ color: 'var(--ink-50)', marginBottom: 'var(--sp-4)', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Module Not Included</h2>
            <p style={{ color: 'var(--ink-200)', marginBottom: 'var(--sp-6)', lineHeight: '1.6' }}>This module is not included in your current package. Upgrade your package to access these lessons.</p>
            <button className="btn btn--primary" onClick={() => router.push('/lessons')} style={{ width: '100%', justifyContent: 'center' }}>← Back to Curriculum</button>
          </div>
        </div>
      </div>
    );
  }

  if (!allowedModules) {
    return (
      <div className="platform" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <PlatformNav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'var(--nav-height)' }}>
          <div style={{ color: 'var(--ink-300)', fontSize: 'var(--text-sm)' }}>Loading lesson...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="platform" style={{ overflow: 'hidden', height: '100vh' }}>
      <PlatformNav />

      <div
        className="lesson-player"
        style={{ height: 'calc(100vh - var(--nav-height))', marginTop: 'var(--nav-height)' }}
        role="main"
        aria-label="Lesson Player"
      >
        {/* Step Rail */}
        <nav className="player-rail" aria-label="Lesson steps">
          {LESSON_STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const statusClass = isActive ? 'active' : idx < currentStep ? 'completed' : '';
            const icon = STEP_ICONS[step.type] ?? '📖';
            return (
              <button
                key={step.id}
                className={`step-rail-item ${statusClass}`}
                onClick={() => handleStepChange(idx)}
                aria-label={`Step ${step.id}: ${step.name}${isActive ? ' (current)' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="step-rail-item__num">S{String(step.id).padStart(2, '0')}</span>
                <span className="step-rail-item__icon" aria-hidden="true">{icon}</span>
                <span className="step-rail-item__label">{step.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="player-content" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="player-content__inner">
              {/* Breadcrumb */}
              <nav aria-label="Lesson breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 'var(--sp-6)' }}>
                <span>Module {module.order}</span>
                <span aria-hidden="true">›</span>
                <span>Lesson {lesson.order}</span>
                <span aria-hidden="true">›</span>
                <span style={{ color: 'var(--brass-400)', fontWeight: 500 }}>{LESSON_STEPS[currentStep]?.name ?? ''}</span>
              </nav>

              {/* Image Gallery (replaces old YouTube embed) */}
              {(() => {
                const images = lesson.galleryImages?.length
                  ? lesson.galleryImages
                  : [
                      `/lessons/${lesson.id}/slide-1.svg`,
                      `/lessons/${lesson.id}/slide-2.svg`,
                      `/lessons/${lesson.id}/slide-3.svg`,
                    ];
                return (
                  <LessonGallery
                    images={images}
                    title={lesson.title}
                    currentSlide={gallerySlide}
                    onSlideChange={(slideIdx) => {
                      // Map slide → step proportionally
                      const mappedStep = Math.min(
                        Math.floor((slideIdx / images.length) * LESSON_STEPS.length),
                        LESSON_STEPS.length - 1
                      );
                      if (mappedStep !== currentStep) {
                        // Set ref so handleStepChange knows NOT to override gallery position
                        stepFromGalleryRef.current = true;
                        handleStepChange(mappedStep);
                      }
                    }}
                  />
                );
              })()}

              <div className="animate-fadeIn" key={currentStep}>
                {LESSON_STEPS[currentStep]?.type === 'kc' || LESSON_STEPS[currentStep]?.type === 'quiz' ? (
                  // Knowledge Check or Quiz Step
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--ink-50)', marginBottom: 'var(--sp-4)' }}>
                      {LESSON_STEPS[currentStep]?.name ?? ''}
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', marginBottom: 'var(--sp-8)' }}>
                      Select the correct answer. Your response is recorded for grading.
                    </p>
                    <div className="card p-6" style={{ marginBottom: 'var(--sp-4)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink-100)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--leading-snug)', fontSize: 'var(--text-sm)' }}>
                        Under a 4% Safe Withdrawal Rate, what corpus is required to replace a monthly lifestyle expense of ₹1,50,000?
                      </div>
                      {['₹3.50 Crores', '₹4.50 Crores', '₹5.00 Crores', '₹2.50 Crores'].map((opt, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--sp-3)', cursor: 'pointer', transition: 'background var(--dur-base)' }}>
                          <input 
                            type="radio" 
                            name="kc1" 
                            value={i} 
                            checked={selectedRadio === i}
                            onChange={() => setSelectedRadio(i)}
                            disabled={quizScore !== null}
                            style={{ accentColor: 'var(--sapphire-500)', width: 18, height: 18 }} 
                            aria-label={opt} 
                          />
                          <span className="num" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-200)' }}>{opt}</span>
                        </label>
                      ))}
                      {quizScore === null ? (
                        <button 
                          className="btn btn--primary btn--sm" 
                          style={{ marginTop: 'var(--sp-4)' }} 
                          disabled={selectedRadio === null}
                          onClick={handleQuizSubmit}
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <div style={{ marginTop: 'var(--sp-4)', color: quizScore > 0 ? 'var(--emerald-400)' : 'var(--rose-400)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                          {quizScore > 0 ? '✓ Correct! 100/100 points recorded.' : '✗ Incorrect. Try again or review notes.'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Default step content
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--ink-50)', marginBottom: 'var(--sp-6)' }}>
                      {LESSON_STEPS[currentStep]?.name ?? ''}
                    </h1>
                    
                    {/* Dynamic description from separate JSON lesson data */}
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-200)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--sp-6)', whiteSpace: 'pre-line' }}>
                      {lesson.steps?.[currentStep]?.description ?? `This step covers formal concepts, case examples, and study modules associated with ${LESSON_STEPS[currentStep]?.name ?? ''}.`}
                    </p>

                    {/* Step Visual Explanation (WebGL 3D Interactive Model) */}
                    {LESSON_STEPS[currentStep]?.type === 'visual' && (
                      <FinancialNode3D 
                        title={`3D Visual Model: ${lesson.title}`} 
                        subtitle="Real-time WebGL 3D asset node & structural risk horizon renderer" 
                      />
                    )}

                    {/* PDF Revision Guide download button */}
                    {lesson.pdfPath && (
                      <div className="card p-5" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--sapphire-400)', textTransform: 'uppercase', marginBottom: '2px' }}>
                            📂 Revision Resource
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-100)', fontWeight: 500 }}>
                            {lesson.title} - PDF Study Guide
                          </div>
                        </div>
                        <a 
                          href={lesson.pdfPath} 
                          download
                          className="btn btn--primary btn--sm" 
                          style={{ background: 'var(--sapphire-600)', borderColor: 'var(--sapphire-500)' }}
                        >
                          Download PDF
                        </a>
                      </div>
                    )}

                    <div className="card p-6" style={{ background: 'rgba(255,255,255,0.015)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 'var(--sp-3)' }}>Study Note</div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-300)', lineHeight: 'var(--leading-relaxed)' }}>
                        Use the left step rail to navigate between the 19 steps of this lesson. Completed steps are marked in emerald. Your current step is highlighted in brass. All steps must be visited before submitting the lesson quiz.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Player Nav — sticky bottom */}
          <div className="player-nav">
            <div className="player-nav__progress" aria-hidden="true">
              <div className="player-nav__progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <button
              className="btn btn--outline"
              disabled={currentStep === 0}
              onClick={() => handleStepChange(currentStep - 1)}
              aria-label="Previous step"
            >
              ← Previous
            </button>
            <span className="num" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }} aria-live="polite">
              Step {currentStep + 1} of {LESSON_STEPS.length}
            </span>
            {currentStep === LESSON_STEPS.length - 1 ? (
              <button onClick={handleFinish} className="btn btn--brass" aria-label="Finish lesson">
                Finish Lesson ✓
              </button>
            ) : (
              <button
                className="btn btn--primary"
                onClick={() => handleStepChange(currentStep + 1)}
                aria-label={`Next: ${LESSON_STEPS[currentStep + 1]?.name}`}
              >
                Next: {LESSON_STEPS[currentStep + 1]?.name.split(' ').slice(0, 2).join(' ')} →
              </button>
            )}
          </div>
        </div>

        {/* AI Tutor Panel */}
        <aside className="ai-panel" aria-label="AI Tutor">
          <div className="ai-panel__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#FAF8F5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🤖</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-100)' }}>AI Tutor</span>
            </div>

            {/* Model Selector Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', padding: '2px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.12)' }}>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.7')}
                title="Google Gemini 3.7 Engine"
                style={{
                  background: selectedModel === 'gemini-3.7' ? '#16A34A' : 'transparent',
                  color: selectedModel === 'gemini-3.7' ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ✨ Gemini 3.7
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('aarka-2.0')}
                title="Aarkaa 2.0 Engine"
                style={{
                  background: selectedModel === 'aarka-2.0' ? '#B8962E' : 'transparent',
                  color: selectedModel === 'aarka-2.0' ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ⚡ Aarkaa 2.0
              </button>
            </div>

            <button
              onClick={resetMessages}
              style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.12)', color: '#64748B', fontSize: '11px', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer' }}
              title="Reset conversation"
            >
              Clear
            </button>
          </div>

          <div className="ai-panel__messages" aria-live="polite" aria-label="Conversation" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-msg ai-msg--${msg.sender}`}>
                {msg.sender === 'ai' ? (
                  <div style={{ width: '100%', background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.75rem', padding: '0.75rem 0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '10px', background: msg.model?.includes('gemini') ? 'rgba(22, 163, 74, 0.1)' : 'rgba(184, 150, 46, 0.1)', color: msg.model?.includes('gemini') ? '#15803D' : '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {msg.model?.includes('gemini') ? '✨ Gemini 3.7' : '⚡ Aarkaa 2.0'}
                      </span>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        style={{ background: 'transparent', border: 'none', color: copiedId === msg.id ? '#16A34A' : '#94A3B8', fontSize: '11px', cursor: 'pointer', padding: '2px 4px' }}
                      >
                        {copiedId === msg.id ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: '1.55' }}>
                      {renderFormattedMarkdown(msg.text)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '0.35rem', textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                ) : (
                  <div style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                    <div style={{ background: '#16A34A', color: '#FFFFFF', padding: '0.6rem 0.85rem', borderRadius: '0.75rem 0.75rem 0.15rem 0.75rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px', textAlign: 'right' }}>{msg.time}</div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="ai-msg ai-msg--ai" aria-live="assertive" aria-label="AI is typing">
                <div style={{ background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.75rem', padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Thinking with {selectedModel === 'gemini-3.7' ? 'Gemini 3.7' : 'Aarkaa 2.0'}...</span>
                  <div className="ai-typing" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-panel__input-area" style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(0,0,0,0.08)', background: '#FAF8F5' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                ref={inputRef}
                className="ai-panel__textarea"
                rows={2}
                placeholder={`Ask ${selectedModel === 'gemini-3.7' ? 'Gemini 3.7' : 'Aarkaa 2.0'} about this step...`}
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAI(); } }}
                aria-label="Type a question for the AI tutor"
                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem', resize: 'none' }}
              />
              <button
                className="btn btn--primary"
                style={{ padding: '0 1rem', alignSelf: 'stretch', borderRadius: '0.5rem', background: '#16A34A', border: 'none', color: '#FFFFFF', fontWeight: 700 }}
                onClick={() => sendAI()}
                aria-label="Send message"
                disabled={!aiInput.trim() || isTyping}
              >
                ↑
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
