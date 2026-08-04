import React from 'react';
import { Loader2 } from 'lucide-react';

const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon: Icon, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "relative flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm rounded-xl transition-all duration-300 ease-out overflow-hidden outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cms-background disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cms-primary text-cms-background hover:bg-[#10d482] focus:ring-cms-primary shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:shadow-[0_0_25px_rgba(0,245,160,0.5)]",
    secondary: "bg-cms-cards text-white border border-white/10 hover:border-cms-primary/50 hover:text-cms-primary focus:ring-cms-primary shadow-sm",
    danger: "bg-cms-danger/10 text-cms-danger border border-cms-danger/20 hover:bg-cms-danger hover:text-white focus:ring-cms-danger",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 focus:ring-white/20"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
      
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default PremiumButton;
