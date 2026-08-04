import React, { forwardRef } from 'react';

const PremiumInput = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cms-primary transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-[#0a0f1c] border border-white/5 rounded-xl px-4 py-2.5 text-white 
            transition-all duration-300 outline-none
            focus:border-cms-primary/50 focus:bg-cms-background focus:shadow-[0_0_15px_rgba(0,245,160,0.15)]
            placeholder:text-gray-600
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-cms-danger focus:border-cms-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'hover:border-white/10'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-cms-danger text-xs mt-1.5 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
});

PremiumInput.displayName = 'PremiumInput';

export default PremiumInput;
