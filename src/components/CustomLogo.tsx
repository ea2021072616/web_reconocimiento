import React from 'react';

interface CustomLogoProps {
  className?: string;
}

export const CustomLogo: React.FC<CustomLogoProps> = ({ className = "w-full h-full" }) => {
  return (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      
      {/* Outer Dotted Arc - Simplified for better scaling */}
      <path 
        d="M 60 256 A 210 210 0 0 0 452 256" 
        fill="none" 
        stroke="#003566" 
        strokeWidth="12" 
        strokeLinecap="round"
        strokeDasharray="12 28" 
      />

      {/* Heart Outline (Two Halves) - Smoother bezier curves */}
      {/* Left Half (Navy) */}
      <path 
        d="M 256 120 C 180 0, 0 100, 100 280 C 150 370, 230 420, 256 460" 
        fill="none" 
        stroke="#003566" 
        strokeWidth="32" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Right Half (Teal) */}
      <path 
        d="M 256 120 C 332 0, 512 100, 412 280 C 362 370, 282 420, 256 460" 
        fill="none" 
        stroke="#00A896" 
        strokeWidth="32" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Family Silhouettes - Unified and Simplified for Clarity */}
      {/* Mother (Left) */}
      <circle cx="180" cy="180" r="32" fill="#003566" />
      <path d="M 140 340 C 130 260, 150 230, 180 230 C 210 230, 230 260, 220 340 Z" fill="#003566" />

      {/* Father (Right) */}
      <circle cx="332" cy="180" r="32" fill="#003566" />
      <path d="M 372 340 C 382 260, 362 230, 332 230 C 302 230, 282 260, 292 340 Z" fill="#003566" />

      {/* Child (Center) */}
      <circle cx="256" cy="240" r="26" fill="#003566" />
      <path d="M 216 340 C 216 280, 236 270, 256 270 C 276 270, 296 280, 296 340 Z" fill="#003566" />

      {/* Cupping Hands - Simplified curves */}
      {/* Left Hand (Navy) */}
      <path 
        d="M 90 280 C 120 370, 180 390, 230 360 C 230 360, 200 340, 160 300 C 130 270, 90 280, 90 280 Z" 
        fill="#003566" 
      />
      {/* Right Hand (Teal) */}
      <path 
        d="M 422 280 C 392 370, 332 390, 282 360 C 282 360, 312 340, 352 300 C 382 270, 422 280, 422 280 Z" 
        fill="#00A896" 
      />

      {/* Siren Circle (Bottom Center) */}
      <circle cx="256" cy="410" r="48" fill="#FFFFFF" stroke="#00A896" strokeWidth="16" />
      {/* Siren Body */}
      <path d="M 226 415 C 226 390, 286 390, 286 415 Z" fill="#00A896" />
      <rect x="220" y="415" width="72" height="10" rx="4" fill="#00A896" />
      {/* Siren Rays */}
      <line x1="256" y1="380" x2="256" y2="360" stroke="#003566" strokeWidth="10" strokeLinecap="round" />
      <line x1="225" y1="385" x2="210" y2="370" stroke="#003566" strokeWidth="10" strokeLinecap="round" />
      <line x1="287" y1="385" x2="302" y2="370" stroke="#003566" strokeWidth="10" strokeLinecap="round" />

      {/* Icons on the Dotted Arc (Enlarged) */}
      {/* Icon 1: User (Left) */}
      <circle cx="60" cy="256" r="36" fill="#FFFFFF" stroke="#00A896" strokeWidth="12" />
      <circle cx="60" cy="246" r="12" fill="#003566" />
      <path d="M 40 276 C 40 260, 80 260, 80 276 Z" fill="#003566" />

      {/* Icon 2: Map Pin (Bottom Right) */}
      <circle cx="452" cy="256" r="36" fill="#FFFFFF" stroke="#003566" strokeWidth="12" />
      <path d="M 452 236 C 440 236, 440 256, 452 272 C 464 256, 464 236, 452 236 Z" fill="#00A896" />
      <circle cx="452" cy="248" r="4" fill="#FFFFFF" />

    </svg>
  );
};
