'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

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
      text: "👋 Welcome to **FinGenIQ Financial Assistance** powered by **Aarkaa AI**.\n\nI provide real-time institutional financial analysis, mathematical derivations, valuation models, portfolio theory, and curriculum guidance.\n\nEnter any financial question or modeling problem to begin.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
        reply = "Please ask a question about finance, valuation, investment analysis, or your course lessons.";
      }

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "The financial assistance engine is currently busy. Please try asking your question again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    const flushTable = (keyIndex: number) => {
      if (tableRows.length >= 2) {
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(2);
        elements.push(
          <div key={`table-${keyIndex}`} style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(206,174,86,0.2)' }}>
              <thead>
                <tr style={{ background: 'rgba(206,174,86,0.1)' }}>
                  {headers.map((h, i) => (
                    <th key={i} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#CEAE56', borderBottom: '1px solid rgba(206,174,86,0.3)', fontWeight: 600 }}>
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: '#CBD5E1', verticalAlign: 'top' }}>
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableRows = [];
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cols = trimmed.slice(1, -1).split('|');
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      if (!trimmed) {
        elements.push(<div key={idx} style={{ height: '0.4rem' }} />);
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: '0.75rem 0 0.35rem', borderBottom: '1px solid rgba(206,174,86,0.2)', paddingBottom: '0.25rem' }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#CEAE56', margin: '0.6rem 0 0.25rem' }}>
            {trimmed.replace('#### ', '')}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('---')) {
        elements.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.75rem 0' }} />);
        return;
      }

      let formatted: React.ReactNode = trimmed;
      if (trimmed.includes('**')) {
        const parts = trimmed.split('**');
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

      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.825rem', color: '#D1D5DB', lineHeight: 1.6, paddingLeft: '0.5rem' }}>
            <span style={{ color: '#CEAE56' }}>•</span>
            <div>{formatted}</div>
          </div>
        );
        return;
      }

      elements.push(
        <p key={idx} style={{ margin: 0, fontSize: '0.825rem', color: '#D1D5DB', lineHeight: 1.6 }}>
          {formatted}
        </p>
      );
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 6, 15, 0.8)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: 720,
          height: '100%',
          background: '#0B1528',
          borderLeft: '1px solid rgba(206,174,86,0.3)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-15px 0 50px rgba(0,0,0,0.8)',
          animation: 'slideLeft 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Terminal Header */}
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
                width: 42,
                height: 42,
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #183070, #050F24)',
                border: '1px solid rgba(206,174,86,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                color: '#CEAE56',
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
                  FinGenIQ Financial Assistance
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
                Live Institutional Financial &amp; Educational Intelligence
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'cleared',
                    sender: 'assistant',
                    text: 'Session reset. Enter any financial topic or question below.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              title="Reset Session"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8',
                padding: '0.35rem 0.6rem',
                borderRadius: '0.375rem',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
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
        </div>

        {/* Message Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
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
                    maxWidth: isUser ? '85%' : '100%',
                    padding: isUser ? '0.75rem 1rem' : '1.25rem',
                    borderRadius: isUser ? '1rem 1rem 0.2rem 1rem' : '0.75rem',
                    background: isUser
                      ? 'linear-gradient(135deg, #183070 0%, #0F204B 100%)'
                      : '#08101E',
                    color: isUser ? '#F1F5F9' : '#D1D5DB',
                    border: isUser
                      ? '1px solid rgba(206,174,86,0.3)'
                      : '1px solid rgba(206,174,86,0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    position: 'relative',
                  }}
                >
                  {!isUser && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#CEAE56', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Financial Analysis Response
                      </span>
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === m.id ? '#10B981' : '#64748B',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === m.id ? '✓ Copied' : '📋 Copy Analysis'}
                      </button>
                    </div>
                  )}

                  {isUser ? (
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{m.text}</p>
                  ) : (
                    renderFormattedMarkdown(m.text)
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748B',
                    marginTop: '4px',
                    padding: '0 4px',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CEAE56', fontSize: '0.825rem', padding: '0.75rem', background: 'rgba(206,174,86,0.05)', borderRadius: '0.5rem', border: '1px solid rgba(206,174,86,0.2)' }}>
              <span>⚡</span>
              <span>Aarkaa AI is generating financial analysis and calculations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
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
              placeholder="Ask any financial question, formula, model, or case study..."
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
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8F6E1C 0%, #B8962E 100%)',
                border: '1px solid #CEAE56',
                borderRadius: '0.5rem',
                color: '#060A16',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Analyze</span>
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
