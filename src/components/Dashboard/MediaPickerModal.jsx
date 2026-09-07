import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import MediaLibraryCore from './MediaLibraryCore';

export default function MediaPickerModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-[#030712]/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#050914] w-full max-w-[1200px] h-[90vh] rounded-2xl border border-[#1e2d42] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#1e2d42] bg-[#0b1120] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14f195]/10 border border-[#14f195]/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[#14f195]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Select Media</h2>
              <p className="text-[#4b6385] text-[10px] font-mono uppercase tracking-wider">Choose an asset from your library</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#131b2c] hover:bg-[#1e2d42] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <MediaLibraryCore 
            isSelectionMode={true} 
            onSelectAsset={(url) => {
              if (onSelect) onSelect(url);
            }} 
          />
        </div>
      </div>
    </div>
  );
}
