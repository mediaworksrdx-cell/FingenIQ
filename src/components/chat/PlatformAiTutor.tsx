'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

const FINANCIAL_PROMPTS = [
  'Explain DCF Valuation step-by-step with WACC',
  'What is the difference between CAGR and XIRR?',
  'How do I analyze P/E ratio and EV/EBITDA multiples?',
  'What are the 3 FinGenIQ credential tiers and grading criteria?',
  'Explain Debt-to-Equity and interest coverage ratio',
];

export default function PlatformAiTutor({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 **Welcome to your FinGenIQ AI Financial Tutor!**\n\nI am powered by **Aarkaa AI** and specialized exclusively in **finance, investments, valuation models, accounting, capital markets, and your platform curriculum**.\n\nHow can I assist your financial studies today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: 'fingeniq-learner-session',
        }),
      });

      const data = await res.json();
      let reply = '';
      if (data.success && data.response) {
        reply = data.response;
      } else {
        reply = "I am specialized exclusively in finance and financial education. Please ask questions about financial concepts, valuation, investing, accounting, or your course lessons.";
      }

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'aarkaa-ai',
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "⚠️ **FinGenIQ AI Tutor**: Financial knowledge engine is currently processing. Please try asking your financial question again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '0.2rem' }} />;

          let formatted: React.ReactNode = line;
          if (line.includes('**')) {
            const parts = line.split('**');
            formatted = parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ color: '#E8C86A', fontWeight: 600 }}>
                  {part}
                </strong>
              ) : (
                part
              )
            );
          }

          return (
            <p key={idx} style={{ margin: 0, lineHeight: 1.55, fontSize: '0.825rem' }}>
              {formatted}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 6, 15, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          height: '100%',
          background: '#0B1528',
          borderLeft: '1px solid rgba(206,174,86,0.3)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.7)',
          animation: 'slideLeft 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#070E1C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #183070, #050F24)',
                border: '1px solid rgba(206,174,86,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#CEAE56',
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9' }}>
                  FinGenIQ AI Tutor
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(206,174,86,0.15)',
                    color: '#CEAE56',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Aarkaa AI
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#8898AA' }}>
                Strict Finance &amp; Educational Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI Tutor"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#94A3B8',
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Financial Domain Notice */}
        <div
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(206,174,86,0.08)',
            borderBottom: '1px solid rgba(206,174,86,0.15)',
            fontSize: '0.7rem',
            color: '#CEAE56',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>🔒</span>
          <span>Guarded: Strictly answers financial &amp; educational curriculum queries only.</span>
        </div>

        {/* Message Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map(m => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '0.75rem 1rem',
                    borderRadius: isUser ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                    background: isUser
                      ? 'linear-gradient(135deg, #183070 0%, #0F204B 100%)'
                      : '#08101E',
                    color: isUser ? '#F1F5F9' : '#D1D5DB',
                    border: isUser
                      ? '1px solid rgba(206,174,86,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  {isUser ? (
                    <p style={{ margin: 0, fontSize: '0.825rem', lineHeight: 1.5 }}>{m.text}</p>
                  ) : (
                    renderFormattedText(m.text)
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748B',
                    marginTop: '3px',
                    padding: '0 4px',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CEAE56', fontSize: '0.8rem', padding: '0.5rem' }}>
              <span>⚡</span>
              <span>Aarkaa AI is analyzing financial models...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div
          style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#08101E',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {FINANCIAL_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              style={{
                padding: '0.35rem 0.75rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(206,174,86,0.2)',
                borderRadius: '1rem',
                color: '#CBD5E1',
                fontSize: '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(206,174,86,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: '#070E1C',
          }}
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about DCF, WACC, SEBI, portfolio strategy..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: '#08101E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: '#F1F5F9',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                border: '1px solid #CEAE56',
                borderRadius: '0.5rem',
                color: '#060A16',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.6 : 1,
              }}
            >
              Send →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
