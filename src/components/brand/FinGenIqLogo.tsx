import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export default function FinGenIqLogo({ className = '', size = 36, showGlow = true }: LogoProps) {
  // Height is scaled proportionally (original viewBox 240 x 140 -> aspect ratio ~ 1.71)
  const width = typeof size === 'number' ? size * 1.71 : size;
  const height = size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 140"
      fill="none"
      width={width}
      height={height}
      className={`fingeniq-logo ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="FinGenIQ Logo"
    >
      <defs>
        {/* Vibrant FinGenIQ Emerald -> Cyan -> Sapphire Gradient */}
        <linearGradient id="fq-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="22%" stopColor="#4ADE80" />
          <stop offset="48%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="88%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Ambient Theme Glow */}
        {showGlow && (
          <filter id="fq-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="4" floodColor="#4ADE80" floodOpacity="0.45" />
            <feDropShadow dx="0" dy="3" stdDeviation="10" floodColor="#06B6D4" floodOpacity="0.3" />
          </filter>
        )}
      </defs>

      <g filter={showGlow ? 'url(#fq-logo-glow)' : undefined}>
        {/* Continuous 3D Infinity-F Ribbon */}
        <path
          d="M 134 20 
             L 52 20 
             C 32 20, 18 34, 18 54 
             L 18 80 
             C 18 102, 36 120, 58 120 
             C 80 120, 102 104, 120 80 
             C 138 56, 160 40, 182 40 
             C 204 40, 222 58, 222 80 
             C 222 102, 204 120, 182 120 
             C 160 120, 138 104, 120 80 
             C 102 56, 80 40, 58 40 
             C 36 40, 18 58, 18 80"
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
