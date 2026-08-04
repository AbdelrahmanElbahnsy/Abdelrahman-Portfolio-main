import React from 'react';

const PremiumCard = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div 
      className={`
        bg-cms-cards/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6
        shadow-premium
        ${hoverEffect ? 'hover:border-cms-primary/30 hover:shadow-premium-hover transition-all duration-500 hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle top glare */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PremiumCard;
