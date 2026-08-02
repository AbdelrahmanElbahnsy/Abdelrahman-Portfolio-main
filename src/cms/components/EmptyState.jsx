import React from 'react';

const EmptyState = ({ message = "No items found.", actionLabel, onAction }) => {
  return (
    <div className="text-center p-12 bg-[#131b2c] rounded-2xl border border-[#1e293b] shadow-xl">
      <p className="text-gray-400 font-medium tracking-wide mb-4">{message}</p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="bg-[#14f195] text-[#0a0f1c] px-4 py-2 rounded-lg font-semibold hover:bg-[#10d482] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
