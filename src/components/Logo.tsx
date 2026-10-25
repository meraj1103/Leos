import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-7 h-7', size = 100 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={`${className} shrink-0 select-none`}
      width={size}
      height={size}
    >
      <defs>
        {/* Dark squircle container gradient */}
        <linearGradient id="leosContainerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e222d" />
          <stop offset="100%" stopColor="#0c0d11" />
        </linearGradient>

        {/* Outer celestial starburst gradient */}
        <linearGradient id="leosOuterSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Inner radiant flare gradient */}
        <radialGradient id="leosInnerCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fbbf24" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#c026d3" stopOpacity="0.8" />
        </radialGradient>

        {/* Core glow filter */}
        <filter id="leosCelestialGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark squircle base */}
      <rect width="100" height="100" rx="24" fill="url(#leosContainerGrad)" stroke="#373c49" strokeWidth="1.5" />

      {/* Secondary diagonal micro-spark */}
      <path 
        d="M 50 24 Q 50 50 24 50 Q 50 50 50 76 Q 50 50 76 50 Q 50 50 50 24 Z" 
        fill="#8b5cf6" 
        opacity="0.45" 
        transform="rotate(45 50 50)" 
      />

      {/* Primary Four-Pointed Starburst */}
      <path 
        d="M 50 10 
           Q 50 48 10 50 
           Q 50 52 50 90 
           Q 50 52 90 50 
           Q 50 48 50 10 Z" 
        fill="url(#leosOuterSparkle)" 
      />

      {/* Intermediate Layer Flare */}
      <path 
        d="M 50 22 
           Q 50 48 22 50 
           Q 50 52 50 78 
           Q 50 52 78 50 
           Q 50 48 50 22 Z" 
        fill="url(#leosInnerCore)" 
        opacity="0.9" 
      />

      {/* Radiant Center Light Spark */}
      <circle cx="50" cy="50" r="6.5" fill="#ffffff" filter="url(#leosCelestialGlow)" />
      <circle cx="50" cy="50" r="3.5" fill="#fef08a" />
    </svg>
  );
};
