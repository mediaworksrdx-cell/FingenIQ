'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ChatbotQA {
  id?: number;
  question: string;
  answer: string;
  category?: string;
  tags?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function GlobalChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [qaList, setQaList] = useState<ChatbotQA[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hello! 👋 I'm the **FinGenIQ Assistant**.\n\nAsk me anything about our 8 curriculum modules, DCF valuation, SIP compounding, certifications, or financial concepts!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Load dynamic Q&As from database
  useEffect(() => {
    fetch('/api/chatbot/qa')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.qas)) {
          setQaList(data.qas);
        }
      })
      .catch(() => {});
  }, []);

  // Hide chat bubble inside platform routes if needed
  const isPlatformRoute = pathname && (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/assessments') ||
    pathname.startsWith('/capstone') ||
    pathname.startsWith('/certification') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/certification-roadmap') ||
    pathname.startsWith('/lesson-player') ||
    pathname.startsWith('/admin')
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (isPlatformRoute) {
    return null;
  }

  // Answer matching engine using dynamic Q&As
  const findAnswer = (query: string): string => {
    const cleanQ = query.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|hola|namaste)/i.test(cleanQ)) {
      return `Hello! 👋 How can I help you with FinGenIQ today? You can ask about our 8 modules, certifications, DCF valuation, SIP compounding, or course details.`;
    }

    // Thanks
    if (/^(thank|thanks|great|awesome|helpful|kudos|nice)/i.test(cleanQ)) {
      return `You're very welcome! 😊 Feel free to ask any other questions about FinGenIQ.`;
    }

    if (qaList.length === 0) {
      return `I can help you understand all 8 FinGenIQ modules, DCF valuation, SIP compounding, and certifications. Please ask your question!`;
    }

    // 1. Exact or Substring Question Match
    for (const item of qaList) {
      const qLower = item.question.toLowerCase();
      if (cleanQ.includes(qLower) || qLower.includes(cleanQ)) {
        return item.answer;
      }
    }

    // 2. Word / Tag Overlap Scoring
    const queryWords = cleanQ.split(/\s+/).filter(w => w.length > 2);
    let bestMatch: ChatbotQA | null = null;
    let highestScore = 0;

    for (const item of qaList) {
      let score = 0;
      const qLower = item.question.toLowerCase();
      
      // Check tags
      try {
        const tags: string[] = typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []);
        for (const tag of tags) {
          if (cleanQ.includes(tag.toLowerCase())) score += 4;
        }
      } catch {}

      // Check words in question
      for (const word of queryWords) {
        if (qLower.includes(word)) {
          score += 3;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore >= 3) {
      return bestMatch.answer;
    }

    // Default Fallback
    return `I can answer queries regarding all FinGenIQ curriculum topics! Here are some common areas:\n\n• **Curriculum**: 44 lessons across 8 Modules.\n• **Valuation**: DCF models, WACC, P/E ratio, and Multiples.\n• **Personal Finance**: SIP compounding, 50-30-20 rule, Emergency Fund.\n• **Certifications**: Distinction (90%+), Proficiency (75-89%), Completion (60-74%).\n\nCould you try rephrasing your question?`;
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(text);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem', lineHeight: '1.55' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '0.2rem' }} />;

          let formatted: React.ReactNode = line;
          if (line.includes('**')) {
            const parts = line.split('**');
            formatted = parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ color: '#FCD34D', fontWeight: 700 }}>
                  {part}
                </strong>
              ) : (
                part
              )
            );
          }

          if (line.startsWith('• ') || line.startsWith('* ')) {
            return (
              <div key={idx} style={{ display: 'flex', gap: '0.4rem', paddingLeft: '0.25rem' }}>
                <span style={{ color: '#F59E0B' }}>•</span>
                <span>{typeof formatted === 'string' ? line.substring(2) : formatted}</span>
              </div>
            );
          }

          return <p key={idx} style={{ margin: 0 }}>{formatted}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* ─── FLOATING LAUNCHER BUTTON ─────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Chat' : 'Open FinGenIQ Assistant'}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #16A34A, #059669)',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.4)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1.35rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>

      {/* ─── CLEAN CHAT WINDOW ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="FinGenIQ Assistant"
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 110px)',
            background: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1.1rem',
              background: '#0B132B',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                }}
              >
                💬
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F8FAFC' }}>
                FinGenIQ Assistant
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '1.1rem',
                cursor: 'pointer',
                padding: '4px 6px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: msg.sender === 'user'
                      ? '1rem 1rem 0.2rem 1rem'
                      : '1rem 1rem 1rem 0.2rem',
                    background: msg.sender === 'user'
                      ? '#16A34A'
                      : '#1E293B',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#F1F5F9',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {msg.sender === 'user' ? (
                    <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 500 }}>{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>
                <span style={{ fontSize: '0.625rem', color: '#64748B', marginTop: '2px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', background: '#1E293B', borderRadius: '0.75rem', width: 'fit-content' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Bar */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              background: '#0B132B',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                background: '#1E293B',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '0.55rem 0.8rem',
                color: '#F8FAFC',
                fontSize: '0.825rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              aria-label="Send message"
              style={{
                width: 34,
                height: 34,
                borderRadius: '0.5rem',
                background: inputText.trim() ? '#16A34A' : '#334155',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: inputText.trim() ? 'pointer' : 'default',
                flexShrink: 0,
                transition: 'background 0.2s',
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
