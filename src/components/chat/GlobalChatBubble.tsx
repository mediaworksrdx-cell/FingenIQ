'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─── KNOWLEDGE BASE & NLP ENGINE ───────────────────────────────────────────── */

interface KBEntry {
  tags: string[];
  patterns: (string | RegExp)[];
  title: string;
  answer: string;
}

const KNOWLEDGE_BASE: KBEntry[] = [
  // 1. FinGenIQ Overview
  {
    title: 'About FinGenIQ',
    tags: ['about', 'fingeniq', 'overview', 'what is', 'platform', 'fingen'],
    patterns: ['what is fingeniq', 'about fingeniq', 'tell me about fingeniq', 'what does fingeniq do', 'who are you', 'what is fingen'],
    answer: `**FinGenIQ** is an institution-grade financial education platform designed to empower financial intelligence for individuals, enterprise teams, and partner institutions.\n\nKey Highlights:\n• **44 Structured Lessons** across 8 core modules.\n• **3 Credential Tiers**: Completion, Proficiency, and Distinction.\n• **Institutional Research Community**: Peer-reviewed financial models, valuation case studies, and insights.\n• **Talent Marketplace**: Connecting certified financial analysts with verified employers.`
  },

  // 2. Curriculum & Modules
  {
    title: 'Curriculum & 8 Modules',
    tags: ['curriculum', 'modules', 'lessons', 'syllabus', 'courses', 'learn', 'content'],
    patterns: ['module', 'curriculum', 'syllabus', 'what will i learn', 'course list', 'all modules', 'lessons'],
    answer: `The FinGenIQ curriculum spans **8 comprehensive modules**:\n\n1. **Financial Literacy Foundations** (Mindset, compounding, goal setting)\n2. **Personal Finance Mastery** (Budgeting, cash flow, debt strategies)\n3. **Banking & Credit Systems** (Monetary policy, loans, credit scoring)\n4. **Investment Fundamentals** (Mutual funds, ETFs, asset allocation)\n5. **Capital Markets & Securities** (Equities, bonds, technical & fundamental analysis)\n6. **Business & Corporate Finance** (DCF valuation, financial statements, working capital)\n7. **Risk Management & Insurance** (Hedging, life & general insurance, portfolio risk)\n8. **Wealth Management & Planning** (Retirement, estate planning, tax optimization)`
  },

  // 3. Certifications & Tiers
  {
    title: 'Certification & Verification',
    tags: ['cert', 'certificate', 'certification', 'tier', 'distinction', 'proficiency', 'completion', 'verify'],
    patterns: ['certification', 'certificate', 'credential', 'tier', 'distinction', 'proficiency', 'verify certificate'],
    answer: `FinGenIQ credentials feature cryptographic **SHA-256 tamper-proof verification**.\n\n🏆 **Distinction** (90%+ weighted score)\n🎓 **Proficiency** (75%–89% weighted score)\n📜 **Completion** (60%–74% weighted score)\n\nGrading weights: 20% Module Assessments + 30% Quizzes/Knowledge Checks + 50% Capstone Valuation Project.\n\nEmployers can verify certificates instantly at [Certification Verification](/certification-roadmap).`
  },

  // 4. Community vs Institutional Portal (Authentication Separation)
  {
    title: 'Community vs LMS Platform',
    tags: ['community', 'login', 'signup', 'register', 'isolate', 'portal', 'lms', 'difference'],
    patterns: ['community login', 'platform login', 'how to signup', 'how to register', 'difference between community and platform', 'create account'],
    answer: `FinGenIQ operates two dedicated environments:\n\n1. **FinGenIQ Community** ([/community/login](/community/login)):\n   • Open self-service registration for public researchers, students, and peers.\n   • Comment on case studies, applaud articles, and join discussions.\n\n2. **Institutional LMS Platform** ([/login](/login)):\n   • Enterprise LMS for structured lessons, module exams, and capstone certifications.\n   • Admin-provisioned corporate & university credentials.`
  },

  // 5. Capstone Project
  {
    title: 'Capstone Project',
    tags: ['capstone', 'project', 'dcf', 'valuation', 'case study', 'final'],
    patterns: ['capstone', 'capstone project', 'final project', 'valuation model'],
    answer: `The **Capstone Project** is the rigorous culmination of the 8 modules:\n\n• **Track A (Equity Valuation)**: Comprehensive Discounted Cash Flow (DCF), 3-statement financial modeling, WACC calculation, and sensitivity analysis of a publicly listed Indian firm.\n• **Track B (Wealth & Portfolio Strategy)**: Multi-asset strategic allocation, tax harvesting, and risk hedging framework.\n\nSubmitted models undergo peer review in the Research Community.`
  },

  // 6. SEBI & Compliance
  {
    title: 'Regulatory Disclaimer & Compliance',
    tags: ['sebi', 'rbi', 'irdai', 'compliance', 'registered', 'advisor', 'disclaimer', 'legal'],
    patterns: ['sebi', 'registered', 'financial advisor', 'is this sebi registered', 'legal advice', 'investment advice'],
    answer: `⚠️ **Regulatory Disclaimer**:\n\nFinGenIQ is strictly an **educational technology platform**. We are **NOT** registered with SEBI, RBI, or IRDAI as financial advisors or portfolio managers.\n\nNone of our content constitutes investment advice, stock recommendations, or solicitations. Always consult a SEBI-registered Investment Advisor for personal financial decisions.`
  },

  // 7. Core Financial Concepts: DCF & Valuation
  {
    title: 'Discounted Cash Flow (DCF)',
    tags: ['dcf', 'discounted cash flow', 'valuation', 'wacc', 'intrinsic value'],
    patterns: ['what is dcf', 'discounted cash flow', 'how to value a company', 'wacc', 'intrinsic value'],
    answer: `**Discounted Cash Flow (DCF)** is an intrinsic valuation methodology that estimates the present value of an investment based on its expected future cash flows.\n\n$$\\text{Enterprise Value} = \\sum_{t=1}^{n} \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}}{(1 + \\text{WACC})^n}$$\n\nKey Steps:\n1. Forecast Free Cash Flow to Firm (FCFF).\n2. Calculate Weighted Average Cost of Capital (WACC).\n3. Estimate Terminal Value using Perpetual Growth or Exit Multiple method.\n4. Discount cash flows back to present value.`
  },

  // 8. Core Financial Concepts: SIP & Compounding
  {
    title: 'SIP & Compound Interest',
    tags: ['sip', 'cagr', 'compounding', 'mutual fund', 'investing', 'interest'],
    patterns: ['what is sip', 'how does sip work', 'cagr', 'compound interest', 'compounding', 'systematic investment plan'],
    answer: `**Systematic Investment Plan (SIP)** allows disciplined investing of a fixed amount periodically into mutual funds or equity baskets.\n\n**The Power of Compounding Formula**:\n$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$\n\nBenefits of SIP:\n• **Rupee Cost Averaging**: Buys more units when markets are down, fewer when up.\n• **Eliminates Market Timing**: Fosters long-term discipline.\n• **Power of Compounding**: Reinvested earnings generate their own gains exponentially over 10+ years.`
  },

  // 9. Core Financial Concepts: P/E Ratio & Multiples
  {
    title: 'P/E Ratio & Relative Valuation',
    tags: ['pe', 'p/e', 'price to earnings', 'multiples', 'valuation', 'pb', 'ebitda'],
    patterns: ['pe ratio', 'p/e ratio', 'price to earnings', 'ev/ebitda', 'relative valuation'],
    answer: `**Price-to-Earnings (P/E) Ratio** measures a company's current share price relative to its per-share earnings (EPS):\n\n$$\\text{P/E Ratio} = \\frac{\\text{Market Price per Share}}{\\text{Earnings Per Share (EPS)}}$$\n\n• **High P/E**: Markets anticipate high future growth or the stock may be overvalued.\n• **Low P/E**: Stock may be undervalued or facing headwinds.\n• Always compare P/E against historical medians, industry peers, and return on equity (ROE).`
  },

  // 10. Core Financial Concepts: Asset Allocation & Emergency Fund
  {
    title: 'Asset Allocation & Emergency Fund',
    tags: ['asset allocation', 'emergency fund', 'budgeting', 'risk', 'portfolio', 'debt', 'equity'],
    patterns: ['asset allocation', 'emergency fund', 'how much emergency fund', 'portfolio diversification', '50 30 20'],
    answer: `**Key Financial Building Blocks**:\n\n1. **Emergency Fund**:\n   • Keep **3–6 months** of essential living expenses in liquid, low-risk instruments (Savings A/C, Liquid Mutual Funds, Sweep-in FDs).\n\n2. **50-30-20 Rule**:\n   • 50% Needs (Rent, food, EMI, bills)\n   • 30% Wants (Travel, entertainment, dining)\n   • 20% Savings & Investments (SIP, PPF, Equities)\n\n3. **Strategic Asset Allocation**:\n   • Balance equities for growth, fixed income/debt for capital preservation, and gold for inflation hedging.`
  },

  // 11. Talent Marketplace
  {
    title: 'Talent Marketplace',
    tags: ['marketplace', 'jobs', 'hiring', 'careers', 'employers', 'recruitment'],
    patterns: ['marketplace', 'talent marketplace', 'how to get hired', 'employer access', 'jobs', 'careers'],
    answer: `The **FinGenIQ Talent Marketplace** connects top-performing certified candidates with verified financial firms, equity research houses, and investment banks.\n\nEmployers can filter by:\n• Certified Credential Tier (Distinction/Proficiency)\n• Verified Capstone models (DCF, Sector Thesis)\n• Quantitative assessment percentiles`
  },

  // 12. Contact & Support
  {
    title: 'Contact & Support',
    tags: ['contact', 'support', 'email', 'help', 'administrator'],
    patterns: ['contact', 'support', 'customer care', 'email', 'help', 'admin email'],
    answer: `Need assistance or institutional licensing for your university or company?\n\n• **Email**: admin@fingeniq.com\n• **Web**: [Contact Us Page](/contact)\n• **Institutional Inquiries**: Reach out via your organization administrator for custom batch licensing.`
  }
];

function generateSmartAnswer(query: string): string {
  const cleanQ = query.toLowerCase().trim();

  // Greeting checks
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|hola|namaste)/i.test(cleanQ)) {
    return `Hello! 👋 I'm the **FinGenIQ Assistant**.\n\nI can help you with:\n• **FinGenIQ Curriculum & 8 Modules**\n• **Certifications & Credential Tiers**\n• **Community vs LMS Platform Accounts**\n• **Financial Concepts (DCF, SIP, CAGR, P/E, Asset Allocation)**\n• **Capstone Projects & Talent Marketplace**\n\nWhat would you like to explore?`;
  }

  // Thanks checks
  if (/^(thank|thanks|great|awesome|helpful|kudos|nice)/i.test(cleanQ)) {
    return `You're very welcome! 😊 If you have any more questions about FinGenIQ or financial frameworks, feel free to ask anytime.`;
  }

  // Exact pattern matching
  for (const item of KNOWLEDGE_BASE) {
    if (item.patterns.some(p => typeof p === 'string' ? cleanQ.includes(p) : p.test(cleanQ))) {
      return item.answer;
    }
  }

  // Tag score matching
  const words = cleanQ.split(/\s+/).filter(w => w.length > 2);
  let bestMatch: KBEntry | null = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const tag of item.tags) {
      if (cleanQ.includes(tag)) score += 3;
      for (const word of words) {
        if (tag.includes(word) || word.includes(tag)) score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 2) {
    return bestMatch.answer;
  }

  // Helpful contextual fallback
  return `I'm happy to help with that! Here are key areas you can ask about:\n\n• **Curriculum**: 44 lessons across 8 modules (Personal Finance, Corporate Finance, Capital Markets, Wealth Management).\n• **Certifications**: Distinction (90%+), Proficiency (75-89%), and Completion (60-74%).\n• **Community Access**: Free public self-registration at [/community/login](/community/login).\n• **Financial Concepts**: Ask me about *DCF modeling, P/E ratio, SIP compounding, CAGR, WACC, or Asset Allocation*.\n\nCould you try rephrasing or selecting one of the suggested topics below?`;
}

/* ─── CHAT COMPONENT ────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function GlobalChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! 👋 I'm the **FinGenIQ Intelligence Assistant**. Ask me anything about our curriculum, certifications, financial concepts, or platform access.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const [sessionId] = useState(() => `fq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      // Connect to AarkaaAI via FinGenIQ assistant API
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const data = await res.json();

      let answer = '';
      if (data.success && data.response && !data.useLocalFallback) {
        answer = data.response;
      } else {
        answer = generateSmartAnswer(text);
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      // Offline / network fallback to smart knowledge engine
      const answer = generateSmartAnswer(text);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      if (!isOpen) setHasUnread(true);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  // Helper to format markdown bold and links cleanly
  const renderFormattedText = (raw: string) => {
    // Split lines
    const lines = raw.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '0.2rem' }} />;
          
          // Format bold text
          let formatted: React.ReactNode = line;
          if (line.includes('**')) {
            const parts = line.split('**');
            formatted = parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#E8C86A', fontWeight: 600 }}>{part}</strong> : part);
          }

          // Format markdown links [text](url)
          if (typeof formatted === 'string' && formatted.includes('[') && formatted.includes('](')) {
            const linkMatch = formatted.match(/\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
              const [full, text, url] = linkMatch;
              const [before, after] = formatted.split(full);
              formatted = (
                <span key={idx}>
                  {before}
                  <Link href={url} style={{ color: '#CEAE56', textDecoration: 'underline', fontWeight: 600 }}>
                    {text}
                  </Link>
                  {after}
                </span>
              );
            }
          }

          return (
            <p key={idx} style={{ margin: 0, lineHeight: 1.5, fontSize: '0.825rem' }}>
              {formatted}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ─── FLOATING BUBBLE BUTTON (Claude Theme) ────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Assistant' : 'Open Aarkaa AI Assistant'}
          title="Aarkaa AI 2.0 Assistant"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isOpen
              ? '#2B2A27'
              : 'linear-gradient(135deg, #CC785C 0%, #A24B31 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(204,120,92,0.6)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 15px rgba(204,120,92,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.4rem',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOpen ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          {isOpen ? '✕' : '💬'}
        </button>

        {/* Pulsating notification dot */}
        {hasUnread && !isOpen && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#CC785C',
            border: '2px solid #1F1E1B',
            boxShadow: '0 0 8px #CC785C',
          }} />
        )}
      </div>

      {/* ─── EXPANDABLE CHAT PANEL (Claude Theme) ─────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Aarkaa AI Assistant"
          style={{
            position: 'fixed',
            bottom: 94,
            right: 24,
            width: 410,
            maxWidth: 'calc(100vw - 32px)',
            height: 570,
            maxHeight: 'calc(100vh - 120px)',
            background: '#1F1E1B',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.25rem',
            boxShadow: '0 25px 65px rgba(0,0,0,0.8), 0 0 20px rgba(204,120,92,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
            animation: 'chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: '#181715',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #CC785C, #8C3E26)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EFEFE9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Aarkaa AI 2.0
                  <span style={{ fontSize: '0.625rem', background: 'rgba(204,120,92,0.15)', color: '#CC785C', border: '1px solid rgba(204,120,92,0.3)', padding: '1px 6px', borderRadius: '9999px', fontWeight: 700 }}>
                    CLAUDE ENGINE
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#87867F' }}>
                  Connected · Institutional Reasoning
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link
                href="/aarkaai"
                onClick={() => setIsOpen(false)}
                title="Open Fullscreen Workspace"
                style={{
                  fontSize: '0.75rem',
                  color: '#CC785C',
                  textDecoration: 'none',
                  padding: '3px 8px',
                  borderRadius: '0.375rem',
                  background: 'rgba(204,120,92,0.1)',
                  fontWeight: 600,
                }}
              >
                Expand ↗
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Minimize Chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#87867F',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '0.375rem',
                }}
              >
                —
              </button>
            </div>
          </div>

          {/* Quick Prompt Carousel (Claude Theme) */}
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'rgba(24,23,21,0.6)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            flexShrink: 0,
          }}>
            {[
              '📈 DCF Valuation',
              '📚 8 Modules',
              '🏆 Certifications',
              '💡 SIP & Compounding',
              '🌐 Community Hub',
            ].map(p => (
              <button
                key={p}
                onClick={() => handleQuickPrompt(p)}
                style={{
                  background: '#2B2A27',
                  color: '#CC785C',
                  border: '1px solid rgba(204,120,92,0.25)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user'
                    ? '1.1rem 1.1rem 0.25rem 1.1rem'
                    : '1.1rem 1.1rem 1.1rem 0.25rem',
                  background: msg.sender === 'user'
                    ? '#CC785C'
                    : '#2B2A27',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#EFEFE9',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                }}>
                  {msg.sender === 'user' ? (
                    <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 500 }}>{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>
                <span style={{ fontSize: '0.625rem', color: '#6A6963', marginTop: '0.2rem', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', background: '#2B2A27', borderRadius: '1rem', width: 'fit-content' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC785C', animation: 'pulse 1s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC785C', animation: 'pulse 1s infinite 0.2s' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC785C', animation: 'pulse 1s infinite 0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar (Claude Theme) */}
          <div style={{
            padding: '0.75rem 1rem',
            background: '#181715',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Aarkaa AI about financial models, DCF, curriculum..."
              style={{
                flex: 1,
                background: '#2B2A27',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '9999px',
                padding: '0.65rem 1rem',
                color: '#EFEFE9',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              aria-label="Send message"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: inputText.trim()
                  ? '#CC785C'
                  : '#2B2A27',
                color: inputText.trim() ? '#FFFFFF' : '#6A6963',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
