import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Image Logo */}
      <img 
        src="/logo.jpeg" 
        alt="Logo H" 
        className="h-full w-auto object-contain"
        onError={(e) => {
          // Fallback if image is missing
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Fallback box if user hasn't added logo.png yet, keeps layout stable */}
      <div className="hidden h-full aspect-[0.8] bg-brand-green flex-col items-center justify-center p-1">
        <span className="text-brand-yellow font-bold text-xl">H</span>
      </div>

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
