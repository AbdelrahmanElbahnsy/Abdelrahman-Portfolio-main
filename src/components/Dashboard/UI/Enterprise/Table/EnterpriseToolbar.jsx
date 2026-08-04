import React from 'react';
import { Search } from 'lucide-react';

export const EnterpriseSearch = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative group w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-500 group-focus-within:text-cms-primary transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cms-primary focus:border-cms-primary transition-all shadow-inner"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
         <kbd className="hidden sm:inline-block text-[10px] font-bold text-gray-500 border border-white/10 rounded px-1.5 py-0.5 bg-black/50">⌘K</kbd>
      </div>
    </div>
  );
};

export const EnterpriseFilters = ({ children }) => {
  return (
    <div className="flex items-center gap-2">
      {children}
    </div>
  );
};

export const EnterpriseToolbar = ({ 
  search, 
  filters, 
  actions,
  viewMode,
  onViewModeChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-1 w-full items-center gap-4">
        {search}
        {filters}
      </div>
      <div className="flex items-center gap-3">
        {onViewModeChange && (
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              title="Table View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              title="Grid View"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};
