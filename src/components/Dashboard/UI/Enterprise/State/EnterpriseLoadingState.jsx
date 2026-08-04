import React from 'react';
import { Loader2 } from 'lucide-react';

const EnterpriseLoadingState = ({ message = 'Loading...', fullHeight = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'h-full min-h-[400px]' : 'py-12'} w-full animate-in fade-in duration-500`}>
      <div className="w-12 h-12 border-4 border-white/5 border-t-cms-primary rounded-full animate-spin shadow-[0_0_15px_rgba(20,241,149,0.2)] mb-4"></div>
      <p className="text-sm font-bold text-gray-400 animate-pulse tracking-wide uppercase">{message}</p>
    </div>
  );
};

export default EnterpriseLoadingState;
