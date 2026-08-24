'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  model?: string;
}

export default function PlatformAiTutor({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedModel, setSelectedModel] = useState<'gemini-3.7' | 'aarka-2.0'>('gemini-3.7');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Welcome to **FinGenIQ Financial Assistance** powered by **Gemini 3.7** & **Aarkaa AI**.\n\nI provide real-time institutional financial analysis, mathematical derivations, valuation models, portfolio theory, and curriculum guidance.\n\nSelect your preferred reasoning model above (**Gemini 3.7** or **Aarkaa 2.0**) and enter any question to begin.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.7',
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
          model: selectedModel,
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
        model: data.model || selectedModel,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "The financial assistance engine is currently busy. Please try asking your question again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel,
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
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(2);
        elements.push(
          <div key={`table-${keyIndex}`} style={{ overflowX: 'auto', margin: '0.85rem 0', borderRadius: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F4F1EA', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  {headerRow.map((h, i) => (
                    <th key={i} style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#0F172A' }}>
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: rIdx % 2 === 0 ? '#FFFFFF' : '#FAF8F5' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: '#334155', verticalAlign: 'top' }}>
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
          <h3 key={idx} style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.35rem', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '0.25rem', fontFamily: 'var(--font-serif)' }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#15803D', margin: '0.6rem 0 0.25rem', fontFamily: 'var(--font-serif)' }}>
            {trimmed.replace('#### ', '')}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('---')) {
        elements.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.08)', margin: '0.75rem 0' }} />);
        return;
      }

      let formatted: React.ReactNode = trimmed;
      if (trimmed.includes('**')) {
        const parts = trimmed.split('**');
        formatted = parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} style={{ color: '#15803D', fontWeight: 700 }}>
              {part}
            </strong>
          ) : (
            part
          )
        );
      }

      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, paddingLeft: '0.5rem' }}>
            <span style={{ color: '#15803D', fontWeight: 700 }}>•</span>
            <div>{formatted}</div>
          </div>
        );
        return;
      }

      elements.push(
        <p key={idx} style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.65 }}>
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
        background: 'rgba(15, 23, 42, 0.45)',
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
          background: '#FAF8F5',
          borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-15px 0 50px rgba(0, 0, 0, 0.1)',
          animation: 'slideLeft 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '0.65rem',
                background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>
                  FinGenIQ Financial Assistance
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(22, 163, 74, 0.1)',
                    color: '#15803D',
                    border: '1px solid rgba(22, 163, 74, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Aarkaa AI
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                Live Institutional Financial &amp; Educational Intelligence
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Model Selector Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#F4F1EA', padding: '2px', borderRadius: '6px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.7')}
                title="Switch to Google Gemini 3.7 Reasoning Engine"
                style={{
                  background: selectedModel === 'gemini-3.7' ? '#15803D' : 'transparent',
                  color: selectedModel === 'gemini-3.7' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ✨ Gemini 3.7
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('aarka-2.0')}
                title="Switch to Aarkaa 2.0 Institutional Engine"
                style={{
                  background: selectedModel === 'aarka-2.0' ? '#15803D' : 'transparent',
                  color: selectedModel === 'aarka-2.0' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ⚡ Aarkaa 2.0
              </button>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'cleared',
                    sender: 'assistant',
                    text: `Session reset with **${selectedModel === 'gemini-3.7' ? 'Gemini 3.7' : 'Aarkaa 2.0'}**. Enter any financial topic or modeling question below.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    model: selectedModel,
                  },
                ]);
              }}
              title="Reset Session"
              style={{
                background: '#F4F1EA',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#334155',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.45rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: '#F4F1EA',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#64748B',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
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
                    borderRadius: isUser ? '1rem 1rem 0.2rem 1rem' : '0.85rem',
                    background: isUser
                      ? 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)'
                      : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#0F172A',
                    border: isUser
                      ? 'none'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: isUser
                      ? '0 4px 14px rgba(21, 128, 61, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                  }}
                >
                  {!isUser && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-serif)' }}>
                          Institutional Analysis
                        </span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(22, 163, 74, 0.08)', color: '#15803D', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(22, 163, 74, 0.2)', fontWeight: 600 }}>
                          {m.model?.includes('gemini') ? '✨ Gemini 3.7' : '⚡ Aarkaa 2.0'}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === m.id ? '#15803D' : '#64748B',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === m.id ? '✓ Copied' : '📋 Copy Analysis'}
                      </button>
                    </div>
                  )}

                  {isUser ? (
                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: '#FFFFFF', fontWeight: 500 }}>{m.text}</p>
                  ) : (
                    renderFormattedMarkdown(m.text)
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#15803D', fontSize: '0.85rem', padding: '0.85rem', background: '#FFFFFF', borderRadius: '0.65rem', border: '1px solid rgba(22, 163, 74, 0.25)', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.1)' }}>
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
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            background: '#FFFFFF',
          }}
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.6rem' }}
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
                padding: '0.8rem 1.1rem',
                background: '#FAF8F5',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '0.65rem',
                color: '#0F172A',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: '0.8rem 1.6rem',
                background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                border: 'none',
                borderRadius: '0.65rem',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
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
