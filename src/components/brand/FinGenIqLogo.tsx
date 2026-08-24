import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export default function FinGenIqLogo({ className = '', size = 34, showGlow = true }: LogoProps) {
  // Height is scaled proportionally (viewBox 220 x 130 -> aspect ratio ~ 1.69)
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
        {/* Vibrant FinGenIQ Emerald -> Electric Cyan -> Royal Blue Gradient */}
        <linearGradient id="fq-ribbon-grad" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="30%" stopColor="#22C55E" />
          <stop offset="55%" stopColor="#06B6D4" />
          <stop offset="80%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Soft Ambient Theme Glow */}
        {showGlow && (
          <filter id="fq-logo-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="1" stdDeviation="3.5" floodColor="#22C55E" floodOpacity="0.4" />
            <feDropShadow dx="0" dy="2" stdDeviation="7" floodColor="#06B6D4" floodOpacity="0.3" />
          </filter>
        )}
      </defs>

      <g filter={showGlow ? 'url(#fq-logo-glow)' : undefined}>
        {/* Continuous 3D Infinity-F Ribbon */}
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
