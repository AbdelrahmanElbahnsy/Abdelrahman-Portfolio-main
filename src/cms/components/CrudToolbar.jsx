import React from 'react';
import { Search, Plus } from 'lucide-react';

const CrudToolbar = ({ 
  title, 
  itemCount, 
  onAdd, 
  onSearch, 
  searchTerm,
  addActionLabel = "Add New"
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        {itemCount !== undefined && (
          <span className="bg-[#1e293b] text-gray-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-[#1e293b]/50">
             {itemCount} Total
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {onSearch && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-sm text-white focus:outline-none focus:border-[#14f195] transition-colors"
            />
          </div>
        )}
        
        {onAdd && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 bg-[#14f195] text-[#0a0f1c] px-4 py-2 rounded-lg font-bold hover:bg-[#10d482] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {addActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default CrudToolbar;
