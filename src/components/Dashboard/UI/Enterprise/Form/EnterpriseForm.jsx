import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EnterpriseInput = ({ label, error, hint, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1.5 text-sm font-bold text-gray-300">{label}</label>}
      <input
        className={`w-full rounded-lg border bg-black/40 p-2.5 text-sm text-white transition-all focus:outline-none focus:ring-1 
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-cms-primary focus:ring-cms-primary/50'}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
      {hint && !error && <span className="mt-1.5 text-xs text-gray-500">{hint}</span>}
    </div>
  );
};

export const EnterpriseTextarea = ({ label, error, hint, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1.5 text-sm font-bold text-gray-300">{label}</label>}
      <textarea
        className={`w-full rounded-lg border bg-black/40 p-2.5 text-sm text-white transition-all focus:outline-none focus:ring-1 custom-scrollbar
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-cms-primary focus:ring-cms-primary/50'}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
      {hint && !error && <span className="mt-1.5 text-xs text-gray-500">{hint}</span>}
    </div>
  );
};

export const EnterpriseFormGroup = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
};
