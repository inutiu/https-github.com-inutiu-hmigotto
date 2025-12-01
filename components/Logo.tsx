import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'full' }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Image Logo - Tries to load logo.jpg first */}
      {!imgError ? (
        <img 
          src="/logo.jpg" 
          alt="Logo H" 
          className="h-full w-auto object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback: CSS constructed Logo if image fails */
        <div className="h-full aspect-[0.8] bg-brand-green flex flex-col items-center justify-center relative overflow-hidden">
           {/* Geometric H shape simulation */}
           <div className="absolute inset-0 flex">
             <div className="w-1/3 h-full bg-brand-green"></div>
             <div className="w-1/3 h-full flex flex-col">
                <div className="h-1/3 bg-brand-green"></div>
                <div className="h-1/3 bg-brand-yellow skew-y-12 origin-bottom-left transform scale-110"></div>
                <div className="h-1/3 bg-brand-green"></div>
             </div>
             <div className="w-1/3 h-full bg-brand-green"></div>
           </div>
           {/* Dot */}
           <div className="absolute top-[15%] w-[25%] aspect-square rounded-full bg-brand-green z-10 border-2 border-brand-light"></div>
           {/* Text for H */}
           <span className="relative z-20 text-brand-yellow font-bold text-xl mix-blend-overlay">H</span>
        </div>
      )}

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
