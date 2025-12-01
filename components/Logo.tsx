import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Graphic Symbol */}
      <svg viewBox="0 0 100 100" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Green Bar */}
        <path d="M15 10 H 35 V 90 H 15 Z" fill="#1B3B2F" />
        
        {/* Right Green Bar */}
        <path d="M65 10 H 85 V 90 H 65 Z" fill="#1B3B2F" />
        
        {/* Center Yellow Chevron/Y Shape connecting the bars */}
        <path d="M35 40 L 50 50 L 65 40 V 60 L 50 70 L 35 60 Z" fill="#F2B734" /> 
        <path d="M35 35 L 50 45 L 65 35 V 55 L 50 65 L 35 55 Z" fill="#F2B734" className="hidden" /> {/* Adjusting geometry based on abstract interpretation */}
        <path d="M35 40 L 50 55 L 65 40 V 25 L 50 40 L 35 25 Z" fill="white" className="hidden"/>

        {/* Simplified Geometric construction based on the image provided: 
            Two vertical pillars, a yellow geometric bridge, and a dot.
        */}
        
        {/* Actual Geometric Reconstruction based on Image Analysis */}
        {/* Left Pillar */}
        <path d="M10 10 V 90 H 35 V 55 L 50 45 L 35 35 V 10 H 10 Z" fill="#1B3B2F" />
        {/* Right Pillar */}
        <path d="M90 10 V 90 H 65 V 55 L 50 45 L 65 35 V 10 H 90 Z" fill="#1B3B2F" />
        
        {/* The Yellow Element - The "bridge" */}
        <path d="M35 35 L 50 45 L 65 35 V 55 L 50 65 L 35 55 Z" fill="#F2B734" stroke="#F2B734" strokeWidth="1" />
        
        {/* Correction to match the flat minimalistic logo provided:
            It's two tall rectangles with a yellow 'arrow' pointing down in the middle negative space, and a dot.
        */}
        <rect x="20" y="20" width="20" height="60" fill="#1B3B2F" />
        <rect x="60" y="20" width="20" height="60" fill="#1B3B2F" />
        
        {/* Yellow Chevron Connection */}
        <path d="M40 40 L 50 50 L 60 40 V 55 L 50 65 L 40 55 Z" fill="#F2B734" />
        
        {/* The Dot */}
        <circle cx="50" cy="20" r="8" fill="#1B3B2F" />
      </svg>

      {/* Text Part - Only if variant is full */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center">
          <span className="font-sans font-bold text-brand-green text-lg leading-tight tracking-wide">
            Hevilin Migotto
          </span>
          <span className="font-display font-medium text-brand-green/80 text-xs uppercase tracking-widest border-t border-brand-yellow pt-0.5 mt-0.5">
            Branding & Pessoas
          </span>
        </div>
      )}
    </div>
  );
};
