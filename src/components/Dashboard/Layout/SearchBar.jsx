import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="relative group w-full max-w-md hidden md:block cursor-pointer"
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cms-primary transition-colors">
        <Search className="w-4 h-4" />
      </div>
      <input 
        type="text" 
        placeholder="Search everything..." 
        readOnly
        className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-12 py-2 text-sm text-white outline-none group-hover:bg-cms-background group-hover:border-cms-primary/50 group-hover:shadow-glow-primary transition-all placeholder:text-gray-500 cursor-pointer pointer-events-none"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
        <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-300">⌘</kbd>
        <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-300">K</kbd>
      </div>
    </div>
  );
};

export default SearchBar;
