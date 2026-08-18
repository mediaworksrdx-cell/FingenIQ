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
      background: '#1F1E1B',
      color: '#EFEFE9',
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
          background: '#181715',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          zIndex: 20,
        }}>
          <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleNewChat}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                background: '#2B2A27',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#EFEFE9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#CC785C', fontSize: '1.1rem' }}>+</span> New chat
              </span>
              <span style={{ fontSize: '0.75rem', color: '#87867F', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                ⌘K
              </span>
            </button>
          </div>

          {/* Chat Sessions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#87867F', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0.25rem' }}>
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
                  background: s.id === activeSessionId ? '#2B2A27' : 'transparent',
                  border: s.id === activeSessionId ? '1px solid rgba(204,120,92,0.3)' : '1px solid transparent',
                  color: s.id === activeSessionId ? '#EFEFE9' : '#B4B3AB',
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: s.id === activeSessionId ? '#CC785C' : '#87867F', fontSize: '0.9rem' }}>💬</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {s.title}
                </span>
              </button>
            ))}
          </div>

          {/* User & Model Footer */}
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#141311' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #CC785C, #9B4F35)',
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
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EFEFE9' }}>Aarkaa AI 2.0</div>
                <div style={{ fontSize: '0.7rem', color: '#87867F' }}>Claude Architecture</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── CHAT MAIN CANVAS ────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', position: 'relative' }}>
          
          {/* Top Bar with Model Picker & Toggle */}
          <div style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(31,30,27,0.85)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#87867F',
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
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 600, color: '#EFEFE9' }}>
                  Aarkaa AI
                </span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(204,120,92,0.15)', color: '#CC785C', border: '1px solid rgba(204,120,92,0.3)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                  2.0 Pro
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{
                  background: '#2B2A27',
                  color: '#EFEFE9',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
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
                style={{ fontSize: '0.75rem', color: '#87867F', textDecoration: 'none', padding: '4px 10px', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)' }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#87867F', marginBottom: '0.1rem' }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#CC785C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.55rem', fontWeight: 800 }}>A</span>
                      <span>Aarkaa AI 2.0</span>
                    </div>
                  )}

                  <div style={{
                    maxWidth: msg.sender === 'user' ? '82%' : '100%',
                    padding: msg.sender === 'user' ? '0.85rem 1.15rem' : '1.25rem 1.5rem',
                    borderRadius: msg.sender === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1rem',
                    background: msg.sender === 'user' ? '#CC785C' : '#2B2A27',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#EFEFE9',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    fontSize: '0.925rem',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    fontFamily: msg.sender === 'assistant' ? '"Inter", system-ui, sans-serif' : 'inherit',
                  }}>
                    {msg.text}
                  </div>

                  <span style={{ fontSize: '0.65rem', color: '#6A6963', padding: '0 4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#2B2A27', borderRadius: '1rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC785C', animation: 'pulse 1s infinite' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC785C', animation: 'pulse 1s infinite 0.2s' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC785C', animation: 'pulse 1s infinite 0.4s' }} />
                  <span style={{ fontSize: '0.75rem', color: '#87867F', marginLeft: '0.25rem' }}>Aarkaa is thinking...</span>
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
                    background: '#2B2A27',
                    color: '#B4B3AB',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s',
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
              background: '#2B2A27',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.25rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
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
                  color: '#EFEFE9',
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
                    style={{ background: 'transparent', border: 'none', color: '#87867F', cursor: 'pointer', fontSize: '1rem', padding: '4px 6px' }}
                  >
                    📎
                  </button>
                  <span style={{ fontSize: '0.7rem', color: '#6A6963' }}>
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
                    background: inputText.trim() && !isTyping ? '#CC785C' : '#3A3935',
                    color: inputText.trim() && !isTyping ? '#FFFFFF' : '#6A6963',
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

            <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#6A6963', marginTop: '0.5rem' }}>
              Aarkaa AI 2.0 can produce inaccurate information about financial assets. Verify critical outputs.
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
