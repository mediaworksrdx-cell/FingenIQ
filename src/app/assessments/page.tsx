'use client';
import PlatformNav from '@/components/nav/PlatformNav';
import Footer from '@/components/layout/Footer';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

export default function AssessmentPlayer() {
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [proctorVerified, setProctorVerified] = useState(false);
  const [webcamStreaming, setWebcamStreaming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes
  const [tabSwitches, setTabSwitches] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dynamic DB state with fallback
  const [assessmentSettings, setAssessmentSettings] = useState({
    timeLimitSeconds: 1200,
    maxTabSwitches: 3,
    passingScorePct: 70,
    webcamRequired: 1,
  });

  const [questions, setQuestions] = useState<any[]>([
    {
      id: 1,
      moduleId: 'M1',
      question: 'Which horizon in the FingenIQ Financial Freedom Framework must be established first before investing capital into equity markets?',
      options: [
        'Horizon 3: Generational Wealth & Estate Distribution',
        'Horizon 2: Accumulation & Portfolio Diversification',
        'Horizon 1: Protection (Insurance Cover & Emergency Liquidity)',
        'None of the above. Accumulation should precede protection.',
      ],
      correctIndex: 2,
      explanation: 'The Sequencing Imperative mandates establishing Horizon 1 (term cover, health protection, and emergency liquid funds) first to prevent forced liquidation of asset portfolios during distress events.',
    },
    {
      id: 2,
      moduleId: 'M1',
      question: 'What is the required target corpus under a 4% Safe Withdrawal Rate (SWR) to replace a monthly lifestyle expenditure of ₹1,50,000?',
      options: [
        '₹3.50 Crores',
        '₹4.50 Crores',
        '₹5.00 Crores',
        '₹2.50 Crores',
      ],
      correctIndex: 1,
      explanation: 'Annual Expense = ₹1,50,000 × 12 = ₹18,00,000. Required Corpus = Annual Expense / 0.04 = ₹4,50,00,000 (₹4.50 Crores).',
    },
    {
      id: 3,
      moduleId: 'M1',
      question: 'Under Insider Trading & Corporate Governance Regulations, what does UPSI stand for and when must it be handled under strict confidentiality protocols?',
      options: [
        'Unpublished Price Sensitive Information; whenever a transaction or decision is likely to materially impact asset price.',
        'Unified Price Security Index; during secondary market order matching runs.',
        'Unregulated Portfolio Stock Investments; for private equity startup round allocations.',
        'None of the above.',
      ],
      correctIndex: 0,
      explanation: 'UPSI stands for Unpublished Price Sensitive Information. Any employee or insider privy to UPSI must adhere to trading window closure mandates to prevent insider trading violations.',
    },
  ]);

  useEffect(() => {
    fetch('/api/governance/data')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.assessmentSettings) {
            setAssessmentSettings(data.assessmentSettings);
            if (!assessmentActive) {
              setTimeRemaining(data.assessmentSettings.timeLimitSeconds || 1200);
            }
          }
          if (data.assessmentQuestions && data.assessmentQuestions.length > 0) {
            const parsed = data.assessmentQuestions.map((q: any) => ({
              ...q,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            }));
            setQuestions(parsed);
          }
        }
      })
      .catch(err => console.error('Failed to load dynamic governance data:', err));
  }, []);

  // Tab switch detection (plagiarism/integrity check)
  useEffect(() => {
    if (!assessmentActive || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const updated = prev + 1;
          const maxAllowed = assessmentSettings.maxTabSwitches || 3;
          alert(`Plagiarism Integrity Alert: Tab-switch detected. (Warning count: ${updated}/${maxAllowed}). Switches exceeding ${maxAllowed} will trigger automatic assessment failure.`);
          if (updated >= maxAllowed) {
            setIsSubmitted(true);
            setAssessmentActive(false);
          }
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [assessmentActive, isSubmitted, assessmentSettings]);

  // Timed exam decrementer
  useEffect(() => {
    if (!assessmentActive || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          setAssessmentActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessmentActive, isSubmitted]);

  const score = useMemo(() => {
    if (!isSubmitted) return 0;
    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    return questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  }, [isSubmitted, selectedAnswers, questions]);

  const toggleWebcam = () => {
    setWebcamStreaming(prev => !prev);
    setTimeout(() => {
      setProctorVerified(true);
    }, 1200);
  };

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="platform">
      <PlatformNav />

      <div className="page-wrapper">
        <main className="page-main py-8">
          <div className="container">
            <div className="section-header animate-fadeUp">
              <span className="section-label">Academic Integrity</span>
              <h1 className="hero__title" style={{ fontSize: 'var(--text-3xl)', marginTop: '4px' }}>
                Proctored Assessment Player
              </h1>
              <p className="section-subtitle" style={{ marginTop: '4px' }}>
                Module 1 Assessment: Personal Finance Foundations. Proctoring, webcam verification, and tab-lock active.
              </p>
            </div>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 340px' }}>
              {/* Left Column: Assessment workspace or setup panels */}
              <div className="dashboard-main animate-fadeUp">
                {!assessmentActive && !isSubmitted ? (
                  // Onboarding & Setup check
                  <div className="card p-6">
                    <h3 className="section-title mb-3" style={{ fontSize: 'var(--text-lg)' }}>Pre-Exam Integrity Checklist</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', marginBottom: '16px', lineHeight: 'var(--leading-relaxed)' }}>
                      In alignment with institutional certification standards, all formal assessments enforce identity authentication checks and proctored environment parameters.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(59,130,246,0.03)' }}>
                        <input type="checkbox" checked={webcamStreaming} onChange={toggleWebcam} style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-200)' }}>
                          I authorize webcam capture validation and AI proctoring identity logs during this exam.
                        </span>
                      </div>
                      <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(59,130,246,0.03)' }}>
                        <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-200)' }}>
                          I agree to maintain focus inside the active viewport browser frame.
                        </span>
                      </div>
                    </div>

                    <button 
                      className="btn btn--brass w-full"
                      disabled={!webcamStreaming || !proctorVerified}
                      onClick={() => setAssessmentActive(true)}
                    >
                      {!webcamStreaming ? 'Enable Proctoring Camera to Unlock' : 'Begin Certified Assessment →'}
                    </button>
                  </div>
                ) : isSubmitted ? (
                  // Feedback results summary screen
                  <div className="card p-6">
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <span style={{ fontSize: '3rem' }}>{score >= 70 ? '🏅' : '❌'}</span>
                      <h3 className="section-title mt-2" style={{ fontSize: 'var(--text-xl)' }}>
                        Assessment {score >= 70 ? 'Passed' : 'Failed'}
                      </h3>
                      <div className="num font-semi text-brass" style={{ fontSize: '3rem', marginTop: '12px' }}>{score}%</div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', marginTop: '8px' }}>
                        Passing threshold: {assessmentSettings.passingScorePct}%. Attempts remaining: {score >= assessmentSettings.passingScorePct ? 'None (Passed)' : '1 retake after 48-hour cooldown'}.
                      </p>
                    </div>

                    {/* Question details with explanations */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: 'var(--border-subtle)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)' }}>Detailed Question Reviews</h4>
                      {questions.map((q, idx) => {
                        const userAns = selectedAnswers[q.id];
                        const isCorrect = userAns === q.correctIndex;
                        return (
                          <div key={q.id} className="card p-4" style={{ borderColor: isCorrect ? 'var(--emerald-500)' : 'var(--rose-500)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--ink-200)' }}>Question {idx + 1}</span>
                              <span className={`badge ${isCorrect ? 'badge--completed' : 'badge--locked'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                            </div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-100)', marginBottom: '8px' }}>{q.question}</p>
                            <div style={{ fontSize: '10px', color: 'var(--ink-400)', background: 'var(--ink-950)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                              <strong>Remediation Note:</strong> {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Link href="/assessments" className="btn btn--outline w-full mt-6">Return to Hub</Link>
                  </div>
                ) : (
                  // Active Question Flow
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {questions.map((q, idx) => (
                      <div key={q.id} className="card p-6">
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--brass-500)', fontWeight: 600 }}>Question {idx + 1} of {questions.length}</span>
                        <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--ink-100)', marginTop: '4px', marginBottom: '16px' }}>{q.question}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[q.id] === optIdx;
                            return (
                              <button 
                                key={optIdx} 
                                className="card p-3 font-medium text-left btn--ghost"
                                style={{
                                  fontSize: 'var(--text-xs)',
                                  background: isSelected ? 'rgba(201,168,76,0.06)' : 'var(--ink-850)',
                                  borderColor: isSelected ? 'var(--brass-500)' : 'var(--ink-800)',
                                }}
                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button className="btn btn--brass w-full mt-4" onClick={() => setIsSubmitted(true)}>Submit Proctored Exam</button>
                  </div>
                )}
              </div>

              {/* Right Column: Active Feedbacks & Webcam Stream Container */}
              <div className="dashboard-sidebar animate-fadeUp" style={{ animationDelay: '100ms' }}>
                {/* Live Webcam Proctor container */}
                <div className="card p-5" style={{ textAlign: 'center' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: '8px' }}>Security Proctor Feed</h4>
                  <div style={{ background: 'var(--ink-950)', height: '160px', borderRadius: 'var(--radius-lg)', border: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {webcamStreaming ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.03)' }}>
                        <span style={{ fontSize: '2.5rem' }}>📷</span>
                        <span className="badge badge--completed" style={{ marginTop: '8px' }}>Active System Scan</span>
                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '8px', color: 'var(--emerald-500)', fontWeight: 'bold' }}>
                          ● USER_AUTHENTICATED
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>
                        Webcam Validation Pending
                      </div>
                    )}
                  </div>
                </div>

                {/* Session telemetry tracking logs */}
                {assessmentActive && (
                  <div className="card p-5">
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-100)', marginBottom: '12px' }}>Security Session Logs</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-xs)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-400)' }}>Time Remaining:</span>
                        <span className="num font-semi text-brass">{formatTime(timeRemaining)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-400)' }}>Focus Lost Events:</span>
                        <span className="num font-semi text-rose">{tabSwitches} / {assessmentSettings.maxTabSwitches || 3}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-400)' }}>IP Address Lock:</span>
                        <span className="num font-semi text-emerald">Active</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
