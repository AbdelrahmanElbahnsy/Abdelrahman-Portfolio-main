import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const EnterpriseErrorState = ({ 
  title = 'Something went wrong', 
  error, 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-red-500/20 rounded-2xl bg-red-500/5 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 text-red-500 border border-red-500/20 shadow-inner">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md mb-6">{error?.message || 'An unexpected error occurred while loading this view.'}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default EnterpriseErrorState;
