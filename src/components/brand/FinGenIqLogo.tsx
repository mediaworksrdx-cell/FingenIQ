import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  showGlow?: boolean;
}

export default function FinGenIqLogo({
  className = '',
  size = 36,
  showText = false,
  showGlow = true,
}: LogoProps) {
  if (showText) {
    // Unified SVG Brand (Emblem + "FinGen IQ" text)
    const height = size;
    const width = typeof size === 'number' ? size * 4.6 : 'auto';

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 280 64"
        fill="none"
        height={height}
        width={width}
        className={`fingeniq-brand ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
        aria-label="FinGen IQ"
      >
        <defs>
          <linearGradient id="fq-brand-ribbon" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="30%" stopColor="#22C55E" />
            <stop offset="55%" stopColor="#06B6D4" />
            <stop offset="80%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="fq-brand-gen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>

          <linearGradient id="fq-brand-iq" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {showGlow && (
            <filter id="fq-brand-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#22C55E" floodOpacity="0.4" />
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#06B6D4" floodOpacity="0.25" />
            </filter>
          )}
        </defs>

        {/* 1. Infinity-F Emblem on Left */}
        <g transform="translate(2, 6) scale(0.38)" filter={showGlow ? 'url(#fq-brand-glow)' : undefined}>
          <path
            d="M 120 22 
               L 52 22 
               C 30 22, 16 36, 16 58 
               L 16 72 
               C 16 94, 32 110, 54 110 
               C 76 110, 96 94, 110 72 
               C 124 50, 144 34, 166 34 
               C 188 34, 204 50, 204 72 
               C 204 94, 188 110, 166 110 
               C 144 110, 124 94, 110 72 
               C 96 50, 76 34, 54 34 
               C 32 34, 16 50, 16 72"
            stroke="url(#fq-brand-ribbon)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* 2. "FinGen IQ" Vector Text */}
        <text
          x="94"
          y="42"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif"
          fontSize="34"
          fontWeight="800"
          letterSpacing="-0.03em"
        >
          <tspan fill="#FFFFFF">Fin</tspan>
          <tspan fill="url(#fq-brand-gen)">Gen</tspan>
          <tspan dx="8" fill="url(#fq-brand-iq)">IQ</tspan>
        </text>
      </svg>
    );
  }

  // Standalone Icon Emblem (viewBox 220 x 130)
  const width = typeof size === 'number' ? size * 1.69 : size;
  const height = size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 130"
      fill="none"
      width={width}
      height={height}
      className={`fingeniq-logo ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="FinGen IQ Logo"
    >
      <defs>
        <linearGradient id="fq-ribbon-grad" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="30%" stopColor="#22C55E" />
          <stop offset="55%" stopColor="#06B6D4" />
          <stop offset="80%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {showGlow && (
          <filter id="fq-logo-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="1" stdDeviation="3.5" floodColor="#22C55E" floodOpacity="0.4" />
            <feDropShadow dx="0" dy="2" stdDeviation="7" floodColor="#06B6D4" floodOpacity="0.3" />
          </filter>
        )}
      </defs>

      <g filter={showGlow ? 'url(#fq-logo-glow)' : undefined}>
        <path
          d="M 120 22 
             L 52 22 
             C 30 22, 16 36, 16 58 
             L 16 72 
             C 16 94, 32 110, 54 110 
             C 76 110, 96 94, 110 72 
             C 124 50, 144 34, 166 34 
             C 188 34, 204 50, 204 72 
             C 204 94, 188 110, 166 110 
             C 144 110, 124 94, 110 72 
             C 96 50, 76 34, 54 34 
             C 32 34, 16 50, 16 72"
          stroke="url(#fq-ribbon-grad)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
