'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PublicNav from '@/components/nav/PublicNav';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export default function AarkaaAIPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-default',
      title: 'Financial Modeling & Valuation',
      updatedAt: 'Just now',
      messages: [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: `Welcome to **Aarkaa AI 2.0**.\n\nI am your unified intelligence assistant powered by institutional financial reasoning, multi-turn RAG, and live capital market algorithms.\n\nHere are some things we can explore together:\n• **DCF & Equity Valuation**: Detailed 3-statement financial models, WACC computation, and sensitivity matrices.\n• **FinGenIQ Curriculum**: Mastery across all 8 modules and 44 core lessons.\n• **Quantitative Strategy**: Technical analysis, Sharpe ratio, beta hedging, and risk-adjusted return models.\n• **Certification Roadmap**: Distinction criteria and tamper-proof verification.`,
          timestamp: '12:00 AM',
          model: 'Aarkaa 2.0 Engine',
        }
      ]
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-default');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Aarkaa 2.0 (High)');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    
    // Update session title if it was first user message
    let sessionTitle = activeSession.title;
    if (activeSession.messages.length <= 1) {
      sessionTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
    }

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s,
      title: sessionTitle,
      messages: updatedMessages,
      updatedAt: 'Just now',
    } : s));

    if (!customPrompt) setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: activeSessionId,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      let replyText = '';

      if (data.success && data.response && !data.useLocalFallback) {
        replyText = data.response;
      } else {
        replyText = getClaudeThemedFallback(text);
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Aarkaa 2.0 Engine',
      };

      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: [...updatedMessages, botMsg],
      } : s));
    } catch {
      const fallbackMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: getClaudeThemedFallback(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Aarkaa 2.0 Engine',
      };

      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: [...updatedMessages, fallbackMsg],
      } : s));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      updatedAt: 'Just now',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: `How can I assist you with financial research, valuation models, or platform intelligence today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'Aarkaa 2.0 Engine',
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const getClaudeThemedFallback = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('dcf') || q.includes('discounted cash flow') || q.includes('valuation')) {
      return `### Discounted Cash Flow (DCF) Valuation Framework\n\nDCF calculates the intrinsic enterprise value of an asset by projecting its future Free Cash Flow to Firm (FCFF) and discounting them to the present value using the **Weighted Average Cost of Capital (WACC)**.\n\n$$\\text{Enterprise Value} = \\sum_{t=1}^{n} \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}}{(1 + \\text{WACC})^n}$$\n\n#### Core Pillars:\n1. **Unlevered Free Cash Flow (FCFF)**:\n   $$\\text{FCFF} = \\text{EBIT}(1 - t) + \\text{D\\&A} - \\Delta\\text{NWC} - \\text{CapEx}$$\n2. **Cost of Capital (WACC)**:\n   $$\\text{WACC} = \\left(\\frac{E}{V} \\times K_e\\right) + \\left(\\frac{D}{V} \\times K_d(1 - t)\\right)$$\n3. **Terminal Value (Gordon Growth Model)**:\n   $$\\text{TV} = \\frac{\\text{FCFF}_{n+1}}{\\text{WACC} - g}$$\n\nWould you like me to walk through a concrete numerical case study or generate an Excel valuation template?`;
    }

    if (q.includes('module') || q.includes('curriculum') || q.includes('lessons')) {
      return `### FinGenIQ Institutional Curriculum Overview\n\nThe FinGenIQ syllabus encompasses **8 modules with 44 structured lessons**:\n\n1. **Financial Literacy Foundations** — Behavioral finance, compound interest dynamics, and lifelong planning.\n2. **Personal Finance Mastery** — Cash flow architecture, tax optimization, and asset protection.\n3. **Banking & Credit Systems** — Central bank transmission mechanisms, yield curves, and credit scoring.\n4. **Investment Fundamentals** — Multi-asset allocation, ETFs, indexation, and factor investing.\n5. **Capital Markets & Securities** — Primary/secondary market microstructure, equities, fixed income, and derivatives.\n6. **Business & Corporate Finance** — Financial statement analysis (3-statement linking), working capital, and DCF valuation.\n7. **Risk Management & Insurance** — Portfolio hedging, Value at Risk (VaR), and risk engineering.\n8. **Wealth Management & Advisory** — Estate planning, retirement modeling, and HNWI asset distribution.\n\nEach module includes interactive simulations, quiz assessments, and verified completion hashes.`;
    }

    if (q.includes('certif') || q.includes('tier') || q.includes('distinction')) {
      return `### Certification & Credential Verification\n\nFinGenIQ issues institution-grade, tamper-proof credentials embedded with cryptographic **SHA-256 validation hashes**:\n\n• 🏆 **Distinction Tier** — Assigned for weighted composite scores of **90%+**.\n• 🎓 **Proficiency Tier** — Assigned for weighted scores between **75% and 89%**.\n• 📜 **Completion Tier** — Awarded for foundational completion at **60% to 74%**.\n\nVerification is open to corporate employers globally at \`/certification-roadmap\`.`;
    }

    return `I understand your inquiry regarding **"${query}"**.\n\nAs the Aarkaa AI 2.0 system, I can assist across:\n• **Institutional Financial Analysis**: Multi-period valuation, sensitivity analyses, and capital structuring.\n• **FinGenIQ Knowledge**: Detailed exploration of all 44 lessons and module assessment criteria.\n• **Market Research**: Peer valuation benchmarks, sector studies, and macro trends.\n\nCould you specify which aspect or numerical model you would like to delve into further?`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F5',
      color: '#0F172A',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <PublicNav />

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* ─── CLAUDE THEME SIDEBAR ────────────────────────────────────────── */}
        <aside style={{
          width: sidebarOpen ? 280 : 0,
          minWidth: sidebarOpen ? 280 : 0,
          background: '#F4F1EA',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          zIndex: 20,
        }}>
          <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={handleNewChat}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#15803D', fontSize: '1.1rem', fontWeight: 700 }}>+</span> New chat
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', background: '#F4F1EA', padding: '2px 6px', borderRadius: '4px' }}>
                ⌘K
              </span>
            </button>
          </div>

          {/* Chat Sessions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0.25rem' }}>
              Conversations
            </div>
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: s.id === activeSessionId ? '#FFFFFF' : 'transparent',
                  border: s.id === activeSessionId ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid transparent',
                  color: s.id === activeSessionId ? '#0F172A' : '#475569',
                  fontSize: '0.825rem',
                  fontWeight: s.id === activeSessionId ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  boxShadow: s.id === activeSessionId ? '0 2px 6px rgba(0, 0, 0, 0.04)' : 'none',
                }}
              >
                <span style={{ color: s.id === activeSessionId ? '#15803D' : '#94A3B8', fontSize: '0.9rem' }}>💬</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {s.title}
                </span>
              </button>
            ))}
          </div>

          {/* User & Model Footer */}
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(0, 0, 0, 0.06)', background: '#EAE6DC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #15803D, #16A34A)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}>
                A
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>Aarkaa AI 2.0</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Claude Architecture</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── CHAT MAIN CANVAS ────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', position: 'relative' }}>
          
          {/* Top Bar with Model Picker & Toggle */}
          <div style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Toggle Sidebar"
              >
                ☰
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                  Aarkaa AI
                </span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(22, 163, 74, 0.1)', color: '#15803D', border: '1px solid rgba(22, 163, 74, 0.3)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                  2.0 Pro
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{
                  background: '#FAF8F5',
                  color: '#0F172A',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '0.5rem',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Aarkaa 2.0 (High)">Aarkaa 2.0 (High Precision)</option>
                <option value="Aarkaa Coder 3B">Aarkaa Coder 3B</option>
                <option value="Aarkaa 7B Reasoning">Aarkaa 7B Reasoning</option>
              </select>

              <Link
                href="/community"
                style={{ fontSize: '0.75rem', color: '#15803D', textDecoration: 'none', padding: '4px 10px', borderRadius: '0.5rem', background: '#F4F1EA', fontWeight: 600 }}
              >
                Research Feed ↗
              </Link>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {activeSession.messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: '0.35rem',
                  }}
                >
                  {msg.sender === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.1rem' }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#15803D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.55rem', fontWeight: 800 }}>A</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Aarkaa AI 2.0</span>
                    </div>
                  )}

                  <div style={{
                    maxWidth: msg.sender === 'user' ? '82%' : '100%',
                    padding: msg.sender === 'user' ? '0.85rem 1.15rem' : '1.25rem 1.5rem',
                    borderRadius: msg.sender === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1rem',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(22, 163, 74, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
                    fontSize: '0.925rem',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    fontFamily: msg.sender === 'assistant' ? '"Inter", system-ui, sans-serif' : 'inherit',
                  }}>
                    {msg.text}
                  </div>

                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', padding: '0 4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#FFFFFF', borderRadius: '1rem', width: 'fit-content', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803D', animation: 'pulse 1s infinite' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803D', animation: 'pulse 1s infinite 0.2s' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803D', animation: 'pulse 1s infinite 0.4s' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.25rem' }}>Aarkaa is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Suggestions (if new chat) */}
          {activeSession.messages.length <= 1 && (
            <div style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: '0 1rem 0.75rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {[
                '📈 Explain DCF formula with WACC',
                '📚 List the 8 FinGenIQ Modules',
                '🏆 How do I earn Distinction tier?',
                '💡 Compare SIP vs Lumpsum compounding',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  style={{
                    background: '#FFFFFF',
                    color: '#334155',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* ─── CLAUDE THEMED PROMPT INPUT DOCK ─────────────────────────────── */}
          <div style={{ width: '100%', maxWidth: 780, margin: '0 auto', padding: '0.5rem 1rem 1.25rem' }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '1.25rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message Aarkaa AI 2.0..."
                rows={2}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    title="Attach financial data"
                    style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem', padding: '4px 6px' }}
                  >
                    📎
                  </button>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    Connected to Aarkaa 2.0 Engine (:5000)
                  </span>
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isTyping}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: inputText.trim() && !isTyping ? '#15803D' : '#E2E8F0',
                    color: inputText.trim() && !isTyping ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    cursor: inputText.trim() && !isTyping ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  ↑
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.5rem' }}>
              Aarkaa AI 2.0 can produce inaccurate information about financial assets. Verify critical outputs.
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
